export default function HeaderSpacer() {
  // مساحة ثابتة لتجنب القفزة تحت الهيدر
  // يتم تحديدها بناءً على ارتفاع الهيدر الفعلي
  return (
    <div 
      className="h-14 sm:h-16 lg:h-20" 
      aria-hidden="true"
    />
  );
}
