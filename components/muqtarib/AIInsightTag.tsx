import { Badge } from "@/components/ui/badge";

interface AIInsightTagProps {
  score: number;
  className?: string;
}

export function AIInsightTag({ score, className = "" }: AIInsightTagProps) {
  if (score >= 90) {
    return (
      <Badge 
        className={`text-green-700 bg-green-100 border-green-300 ${className}`}
        variant="outline"
      >
        <span className="mr-1">🍒</span>
        +91% إبداعي
      </Badge>
    );
  }
  
  if (score >= 75) {
    return (
      <Badge 
        className={`text-yellow-700 bg-yellow-100 border-yellow-300 ${className}`}
        variant="outline"
      >
        <span className="mr-1">💡</span>
        +76% مثير للتفكير
      </Badge>
    );
  }
  
  return (
    <Badge 
      className={`text-gray-600 bg-gray-100 border-gray-300 ${className}`}
      variant="outline"
    >
      <span className="mr-1">🤔</span>
      تحليل بشري
    </Badge>
  );
}