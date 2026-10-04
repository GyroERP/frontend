import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { UploadOutlined } from '@ant-design/icons'
import { Button, Modal, Skeleton, Tag, Upload } from 'antd'
import { Upload as UploadIcon, FileText, CheckCircle, XCircle, Clock } from 'lucide-react'
import { aiKeys } from '../api/keys'
import { PageShell } from '@/erp/enterprise/PageShell'
import { apiClient } from '@/api/client'
import { extractErrorMessage } from '@/api/client'
import { notify } from '@/lib/notify'
import { formatDateTime } from '@/lib/date'
import type { AIDocument } from '../api/types'
import type { PaginatedResponse } from '@/api/types/common'

const DOC_STATE_ICON = {
  PENDING: <Clock className="size-4 text-neutral-400" />,
  PROCESSING: <Clock className="size-4 text-amber-500 animate-spin" />,
  DONE: <CheckCircle className="size-4 text-green-600" />,
  FAILED: <XCircle className="size-4 text-red-600" />,
}

const DOC_STATE_TAG: Record<string, string> = {
  PENDING: 'default',
  PROCESSING: 'warning',
  DONE: 'success',
  FAILED: 'error',
}

function getFileName(doc: AIDocument): string {
  if (doc.file_url) {
    const parts = doc.file_url.split('/')
    return parts[parts.length - 1] ?? doc.document_type
  }
  return doc.document_type
}

export function DocumentOCRPage() {
  const queryClient = useQueryClient()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<AIDocument | null>(null)
  const [uploading, setUploading] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: aiKeys.documents(),
    queryFn: () =>
      apiClient.get<PaginatedResponse<AIDocument>>('/gyroai/documents/', {
        params: { page_size: 25 },
      }),
    staleTime: 15_000,
    refetchInterval: (query) => {
      const hasProcessing = query.state.data?.data?.results?.some(
        (d) => d.state === 'PROCESSING' || d.state === 'PENDING',
      )
      return hasProcessing ? 5000 : false
    },
  })

  async function uploadFiles(fileList: File[]) {
    setUploading(true)
    try {
      for (const file of fileList) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('document_type', 'OTHER')
        await apiClient.post<AIDocument>('/gyroai/documents/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      notify.success('Document(s) uploaded — processing started')
      setUploadOpen(false)
      void queryClient.invalidateQueries({ queryKey: aiKeys.documents() })
    } catch (err) {
      notify.error(extractErrorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  const documents = data?.data.results ?? []

  return (
    <PageShell
      title="Document OCR"
      breadcrumbs={[{ label: 'AI' }, { label: 'Documents' }]}
      actions={
        <Button type="primary" icon={<UploadIcon className="size-4" />} onClick={() => setUploadOpen(true)}>
          Upload Document
        </Button>
      }
    >
      <div className="mx-auto max-w-4xl space-y-3">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <Skeleton key={i} active style={{ width: '100%', height: 64 }} />
          ))
        ) : documents.length === 0 ? (
          <div className="text-center py-16 text-neutral-400">
            <FileText className="size-12 mx-auto mb-3 text-neutral-300" />
            <p>No documents yet. Upload invoices, bills, receipts or contracts.</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-4 bg-white border border-neutral-200 rounded-lg p-4 hover:border-brand-200 cursor-pointer transition-colors"
              onClick={() => setSelectedDoc(doc)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedDoc(doc)}
            >
              {DOC_STATE_ICON[doc.state]}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-700 truncate">{getFileName(doc)}</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {formatDateTime(doc.created_at)} · {doc.document_type}
                </p>
              </div>
              <Tag color={DOC_STATE_TAG[doc.state] ?? 'default'}>{doc.state}</Tag>
            </div>
          ))
        )}
      </div>

      <Modal
        open={uploadOpen}
        title="Upload Document for OCR"
        onCancel={() => setUploadOpen(false)}
        footer={
          <Button onClick={() => setUploadOpen(false)}>Close</Button>
        }
      >
        <Upload.Dragger
          multiple
          accept="image/*,.pdf"
          showUploadList={false}
          disabled={uploading}
          beforeUpload={(_, fileList) => {
            void uploadFiles(fileList as unknown as File[])
            return false
          }}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">Click or drag files to upload</p>
          <p className="ant-upload-hint text-neutral-400">
            Supported: images (JPG, PNG) and PDFs, max 25 MB
          </p>
        </Upload.Dragger>
      </Modal>

      <Modal
        open={!!selectedDoc}
        title={selectedDoc ? `Extracted Data — ${getFileName(selectedDoc)}` : ''}
        width={720}
        onCancel={() => setSelectedDoc(null)}
        footer={<Button type="primary" onClick={() => setSelectedDoc(null)}>Close</Button>}
      >
        {selectedDoc && selectedDoc.state !== 'DONE' ? (
          <div className="text-center py-8 text-neutral-400">
            <Tag color={DOC_STATE_TAG[selectedDoc.state] ?? 'default'}>{selectedDoc.state}</Tag>
            <p className="mt-2 text-sm">
              {selectedDoc.state === 'PROCESSING'
                ? 'Processing in progress…'
                : selectedDoc.error_message ?? 'Pending'}
            </p>
          </div>
        ) : selectedDoc ? (
          <pre className="text-xs bg-neutral-50 border border-neutral-200 rounded-md p-4 overflow-auto max-h-96">
            {JSON.stringify(selectedDoc.extracted_data, null, 2)}
          </pre>
        ) : null}
      </Modal>
    </PageShell>
  )
}
