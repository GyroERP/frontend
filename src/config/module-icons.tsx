import {
  AppstoreOutlined,
  BankOutlined,
  CalculatorOutlined,
  CarOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
  DashboardOutlined,
  FolderOpenOutlined,
  RobotOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  ToolOutlined,
  TruckOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'

const ICON_MAP: Record<string, ReactNode> = {
  LayoutDashboard: <DashboardOutlined />,
  Settings: <SettingOutlined />,
  Package: <AppstoreOutlined />,
  ShoppingCart: <ShoppingCartOutlined />,
  Truck: <TruckOutlined />,
  Users: <TeamOutlined />,
  Calculator: <CalculatorOutlined />,
  Receipt: <WalletOutlined />,
  UserCircle: <UserOutlined />,
  Banknote: <BankOutlined />,
  Clock: <ClockCircleOutlined />,
  Briefcase: <FolderOpenOutlined />,
  Factory: <AppstoreOutlined />,
  CheckSquare: <CheckSquareOutlined />,
  Wrench: <ToolOutlined />,
  FolderKanban: <FolderOpenOutlined />,
  Headphones: <CustomerServiceOutlined />,
  Car: <CarOutlined />,
  Bot: <RobotOutlined />,
}

export function ModuleIcon({ name }: { name: string }) {
  return ICON_MAP[name] ?? <AppstoreOutlined />
}
