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
      avatar: true,
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
    <div className="space-y-4">
      <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span>💬</span>
        <span>التعليقات ({comments.length})</span>
      </h4>
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-center">
                {comment.user?.avatar ? (
                  <img
                    src={comment.user.avatar}
                    alt={comment.user.name || "مستخدم"}
                    className="w-12 h-12 rounded-full object-cover mb-2"
                  />
                ) : (
                  <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center mb-2">
                    <span className="text-base font-medium">
                      {comment.user?.name?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                )}
                <div className="space-y-1">
                  <div className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                    {comment.user?.name || "مستخدم"}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {new Date(comment.created_at).toLocaleDateString("en-US", {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {new Date(comment.created_at).toLocaleTimeString("ar-SA", {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
              <div className="flex-1 pt-2">
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-[15px]">
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
