export function BlockButton({ userId }: { userId: string }) {
  return (
    <form action="/api/block" method="post">
      <input type="hidden" name="blocked_user_id" value={userId} />
      <button className="btn">Block</button>
    </form>
  );
}
