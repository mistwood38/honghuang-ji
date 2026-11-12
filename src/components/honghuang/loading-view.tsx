export function LoadingView() {
  return (
    <div className="world-awakening" role="status" aria-live="polite">
      <img
        className="awakening-landscape"
        src="/art/cultivation-sanctuary-small.webp"
        alt=""
        width="640"
        height="427"
      />
      <div className="awakening-veil" aria-hidden="true" />
      <div className="awakening-content">
        <p className="awakening-kicker">天地将启 · 此生待续</p>
        <img
          className="awakening-emblem"
          src="/art/app-emblem.webp"
          alt=""
          width="160"
          height="160"
        />
        <h1>洪荒纪</h1>
        <p className="awakening-verse">一念起，山海生。</p>
        <span className="awakening-light" aria-hidden="true">
          <i />
        </span>
        <p className="awakening-note">正在展开你的山海</p>
      </div>
      <p className="awakening-footer">混沌本纪 · 洪荒神话</p>
    </div>
  );
}
