import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { VitalDataModule } from "@/components/vital/vital-data-module"

export default function VitalPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">バイタルデータ</h1>
          <p className="text-muted-foreground mt-2">活動量・睡眠・自律神経解析のデータを表示します</p>
        </div>
        <VitalDataModule />
      </div>
    </DashboardLayout>
  )
}

