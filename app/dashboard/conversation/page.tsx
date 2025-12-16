import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ConversationModule } from "@/components/conversation/conversation-module"

export default function ConversationPage() {
  return (
    <DashboardLayout>
      <ConversationModule />
    </DashboardLayout>
  )
}
