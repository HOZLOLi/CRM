import { PageHeader } from "@/components/layout/page-header";
import { AssistantChat } from "@/components/features/assistant-chat";
import { isAiConfigured, getModelId } from "@/server/ai/provider";

export const metadata = { title: "دستیار هوش مصنوعی" };
export const dynamic = "force-dynamic";

export default function AssistantPage() {
  const configured = isAiConfigured();

  return (
    <>
      <PageHeader
        title="دستیار هوش مصنوعی"
        description={
          configured
            ? `متصل به ${getModelId()} — پاسخ‌ها بر پایه داده‌های همین CRM ساخته می‌شوند.`
            : "برای فعال‌سازی، کلید و آدرس ارائه‌دهنده را در فایل .env تنظیم کنید."
        }
      />
      <AssistantChat configured={configured} />
    </>
  );
}
