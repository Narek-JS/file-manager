import classNames from "classnames";
import React from "react";

interface Props {
  index: number;
}

const CopiedTooltip: React.FC<Props> = ({ index }) => {
  return (
    <p
      className={classNames(
        "absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded bg-black text-white animate-fadeInOut z-50",
        {
          "!top-[10px] !left-10": index < 1,
        }
      )}
    >
      Copied
    </p>
  );
};

export { CopiedTooltip };
