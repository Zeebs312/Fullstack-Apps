import { prisma } from "@/lib/prisma";
import DTBClient from "@/components/DTBClient";

export default async function DailyLearningPage() {
    const dbEntries = await prisma.learningEntry.findMany({
        orderBy: { createdAt: "asc" },
    });

    return <DTBClient dbEntries={dbEntries} />;
}