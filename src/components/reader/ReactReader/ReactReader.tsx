import React, {
  type CSSProperties,
  type ReactNode,
  useRef,
  useState,
} from "react";
import {
  type SwipeableProps,
  type SwipeEventData,
  useSwipeable,
} from "react-swipeable";
import { EpubView, type IEpubViewProps } from "../EpubView/EpubView";
import { type IEpubViewStyle } from "../EpubView/style";
import {
  ReactReaderStyle as defaultStyles,
  type IReactReaderStyle,
} from "./style";

import { type NavItem } from "epubjs";

type SwipeWrapperProps = {
  children: ReactNode;
  swipeProps: Partial<SwipeableProps>;
};

const SwipeWrapper = ({ children, swipeProps }: SwipeWrapperProps) => {
  const handlers = useSwipeable(swipeProps);
  return (
    <div style={{ height: "100%" }} {...handlers}>
      {children}
    </div>
  );
};

type TocItemProps = {
  data: NavItem;
  setLocation: (value: string) => void;
  styles?: CSSProperties;
};

const TocItem = ({ data, setLocation, styles }: TocItemProps) => (
  <div>
    <button onClick={() => setLocation(data.href)} style={styles}>
      {data.label}
    </button>
    {data.subitems && data.subitems.length > 0 && (
      <div style={{ paddingLeft: 10 }}>
        {data.subitems.map((item, i) => (
          <TocItem
            key={i}
            data={item}
            styles={styles}
            setLocation={setLocation}
          />
        ))}
      </div>
    )}
  </div>
);

export type IReactReaderProps = IEpubViewProps & {
  title?: string;
  showToc?: boolean;
  readerStyles?: IReactReaderStyle;
  epubViewStyles?: IEpubViewStyle;
  swipeable?: boolean;
  isRTL?: boolean;
};

export const ReactReader = ({
  title,
  showToc = true,
  loadingView,
  readerStyles = defaultStyles,
  locationChanged,
  swipeable,
  epubViewStyles,
  isRTL = false,
  tocChanged,
  ...props
}: IReactReaderProps) => {
  const [expandedToc, setExpandedToc] = useState(false);
  const [toc, setToc] = useState<NavItem[]>([]);
  const readerRef = useRef<EpubView>(null);

  const toggleToc = () => {
    setExpandedToc(!expandedToc);
  };

  const next = () => {
    const node = readerRef.current;
    if (node && node.nextPage) {
      node.nextPage();
    }
  };

  const prev = () => {
    const node = readerRef.current;
    if (node && node.prevPage) {
      node.prevPage();
    }
  };

  const handleTocChange = (newToc: NavItem[]) => {
    setToc(newToc);
    if (tocChanged) {
      tocChanged(newToc);
    }
  };

  const handleSetLocation = (loc: string) => {
    setExpandedToc(false);
    if (locationChanged) {
      locationChanged(loc);
    }
  };

  return (
    <div style={readerStyles.container}>
      <div
        style={Object.assign(
          {},
          readerStyles.readerArea,
          expandedToc ? readerStyles.containerExpanded : {},
        )}
      >
        {showToc && (
          <button
            style={Object.assign(
              {},
              readerStyles.tocButton,
              expandedToc ? readerStyles.tocButtonExpanded : {},
            )}
            onClick={toggleToc}
          >
            <span
              style={Object.assign(
                {},
                readerStyles.tocButtonBar,
                readerStyles.tocButtonBarTop,
              )}
            />
            <span
              style={Object.assign(
                {},
                readerStyles.tocButtonBar,
                readerStyles.tocButtonBottom,
              )}
            />
          </button>
        )}
        <div style={readerStyles.titleArea}>{title}</div>
        <SwipeWrapper
          swipeProps={{
            onSwiped: (eventData: SwipeEventData) => {
              const { dir } = eventData;
              if (dir === "Left") {
                isRTL ? prev() : next();
              }
              if (dir === "Right") {
                isRTL ? next() : prev();
              }
            },
            onTouchStartOrOnMouseDown: ({ event }) => event.preventDefault(),
            touchEventOptions: { passive: false },
            preventScrollOnSwipe: true,
            trackMouse: true,
          }}
        >
          <div style={readerStyles.reader}>
            <EpubView
              ref={readerRef}
              loadingView={
                loadingView === undefined ? (
                  <div style={readerStyles.loadingView}>Loading…</div>
                ) : (
                  loadingView
                )
              }
              epubViewStyles={epubViewStyles}
              {...props}
              tocChanged={handleTocChange}
              locationChanged={locationChanged}
            />
            {swipeable && <div style={readerStyles.swipeWrapper} />}
          </div>
        </SwipeWrapper>
        <button
          style={Object.assign({}, readerStyles.arrow, readerStyles.prev, {transform: 'rotate(90deg)', top: '20%'})}
          onClick={() => isRTL ? next() : prev()}
        >
          ‹
        </button>
        <button
          style={Object.assign({}, readerStyles.arrow, readerStyles.next, {transform: 'rotate(90deg)', top: '80%'})}
          onClick={() => isRTL ? prev() : next()}
        >
          ›
        </button>
      </div>
      {showToc && (
        <div>
          <div style={readerStyles.tocArea}>
            <div style={readerStyles.toc}>
              {toc.map((item, i) => (
                <TocItem
                  data={item}
                  key={i}
                  setLocation={handleSetLocation}
                  styles={readerStyles.tocAreaButton}
                />
              ))}
            </div>
          </div>
          {expandedToc && (
            <div style={readerStyles.tocBackground} onClick={toggleToc} />
          )}
        </div>
      )}
    </div>
  );
};
