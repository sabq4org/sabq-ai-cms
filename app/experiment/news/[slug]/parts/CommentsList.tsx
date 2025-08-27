import prisma from "@/lib/prisma";

interface CommentsListProps {
  articleId: string;
}

async function getComments(articleId: string) {
  const comments = await prisma.comments.findMany({
    where: {
      article_id: articleId,
      status: "approved",
    },
    orderBy: {
      created_at: "desc",
    },
    take: 50,
  });

  // جلب معلومات المستخدمين للتعليقات
  const userIds = comments.filter(c => c.user_id).map(c => c.user_id as string);
  const users = userIds.length > 0 ? await prisma.users.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  }) : [];

  // دمج معلومات المستخدمين مع التعليقات
  const commentsWithUsers = comments.map(comment => {
    const user = users.find(u => u.id === comment.user_id);
    return {
      ...comment,
      user: user || null,
    };
  });

  return commentsWithUsers;
}

export default async function CommentsList({ articleId }: CommentsListProps) {
  const comments = await getComments(articleId);

  if (comments.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 space-y-4">
      <h4 className="text-lg font-semibold mb-4">التعليقات ({comments.length})</h4>
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {comment.user?.name?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {comment.user?.name || "مستخدم"}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {new Date(comment.created_at).toLocaleDateString("ar-SA")}
                  </span>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
