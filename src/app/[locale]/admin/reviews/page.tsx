import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewsTable } from "@/components/admin/reviews/ReviewsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";

export const dynamic = "force-dynamic";

async function getAllReviews() {
  return await prisma.review.findMany({
    include: {
      coach: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          slug: true,
          avatarUrl: true,
        },
      },
      player: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      reservation: {
        select: {
          id: true,
          startDate: true,
        },
      },
    },
    orderBy: [
      { isPublic: "asc" }, // Non publiés en premier
      { createdAt: "desc" },
    ],
  });
}

export default async function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg">
          <Star className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Modération des Avis</h1>
          <p className="text-sm text-gray-400">
            Gérer les avis externes et post-session des coachs
          </p>
        </div>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="bg-white/10 border border-white/20">
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white"
          >
            En attente
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white"
          >
            Approuvés
          </TabsTrigger>
          <TabsTrigger
            value="external"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white"
          >
            Externes
          </TabsTrigger>
          <TabsTrigger
            value="reservation"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white"
          >
            Post-session
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white"
          >
            Tous
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
            <ReviewsTableWrapper filter="pending" />
          </Suspense>
        </TabsContent>

        <TabsContent value="approved">
          <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
            <ReviewsTableWrapper filter="approved" />
          </Suspense>
        </TabsContent>

        <TabsContent value="external">
          <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
            <ReviewsTableWrapper filter="external" />
          </Suspense>
        </TabsContent>

        <TabsContent value="reservation">
          <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
            <ReviewsTableWrapper filter="reservation" />
          </Suspense>
        </TabsContent>

        <TabsContent value="all">
          <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
            <ReviewsTableWrapper filter="all" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function ReviewsTableWrapper({
  filter,
}: {
  filter: "pending" | "approved" | "external" | "reservation" | "all";
}) {
  const allReviews = await getAllReviews();

  let filteredReviews = allReviews;

  switch (filter) {
    case "pending":
      filteredReviews = allReviews.filter((r) => !r.isPublic);
      break;
    case "approved":
      filteredReviews = allReviews.filter((r) => r.isPublic);
      break;
    case "external":
      filteredReviews = allReviews.filter((r) => r.source === "EXTERNAL");
      break;
    case "reservation":
      filteredReviews = allReviews.filter((r) => r.source === "RESERVATION");
      break;
    case "all":
    default:
      filteredReviews = allReviews;
      break;
  }

  return <ReviewsTable reviews={filteredReviews} />;
}
