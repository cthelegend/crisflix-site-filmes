const BackgroundPattern = () => (
  <svg className="background-pattern" width="100%" height="100%" aria-hidden="true" focusable="false">
    <defs>
      <pattern id="collective-symbols" width="780" height="700" patternUnits="userSpaceOnUse">
        <image href="/hammer-sickle.png" x="37" y="27" width="130" height="130" opacity="0.111" transform="rotate(-28 102 92)" />
        <image href="/hammer-sickle.png" x="376.5" y="46.5" width="185" height="185" opacity="0.076" transform="rotate(34 469 139)" />
        <image href="/hammer-sickle.png" x="656.5" y="228.5" width="91" height="91" opacity="0.136" transform="rotate(152 702 274)" />
        <image href="/hammer-sickle.png" x="197.5" y="281.5" width="149" height="149" opacity="0.093" transform="rotate(78 272 356)" />
        <image href="/hammer-sickle.png" x="53" y="517" width="106" height="106" opacity="0.076" transform="rotate(-132 106 570)" />
        <image href="/hammer-sickle.png" x="478" y="476" width="166" height="166" opacity="0.111" transform="rotate(-48 561 559)" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#collective-symbols)" />
  </svg>
);

export default BackgroundPattern;
