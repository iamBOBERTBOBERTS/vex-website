"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import { useAdaptiveEffects } from "@/hooks/useAdaptiveEffects";
import styles from "./ImmersiveVehicleCard.module.css";

export type ImmersiveVehicleCardProps = {
  inventoryId?: string;
  href: string;
  imageUrl: string | null;
  lotTag?: string | null;
  badge?: string | null;
  badges?: string[];
  title: string;
  meta?: string | null;
  price: string;
  cta?: string;
  enableQuickActions?: boolean;
  className?: string;
  imageClassName?: string;
};

export function ImmersiveVehicleCard({
  inventoryId,
  href,
  imageUrl,
  lotTag,
  badge,
  badges = [],
  title,
  meta,
  price,
  cta = "View details",
  enableQuickActions = true,
  className,
  imageClassName,
}: ImmersiveVehicleCardProps) {
  const { allowHeavyFx } = useAdaptiveEffects();
  const cardRef = useRef<HTMLElement | null>(null);
  const imageWrapRef = useRef<HTMLDivElement | null>(null);
  const badgesRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);

  const canAnimate = useMemo(() => allowHeavyFx, [allowHeavyFx]);
  const quickBuildHref = inventoryId ? `/build?inventoryId=${encodeURIComponent(inventoryId)}` : href;
  const quickReserveHref = inventoryId ? `/checkout?inventoryId=${encodeURIComponent(inventoryId)}` : href;

  useEffect(() => {
    const el = cardRef.current;
    const imgWrap = imageWrapRef.current;
    const bWrap = badgesRef.current;
    const aWrap = actionsRef.current;
    if (!el || !imgWrap || !canAnimate) return;

    let cleanup: (() => void) | null = null;
    let disposed = false;

    (async () => {
      try {
        const { gsap } = await import("gsap");
        if (disposed) return;

        gsap.set(el, { willChange: "transform, box-shadow" });
        gsap.set(imgWrap, { willChange: "transform" });
        if (bWrap) gsap.set(bWrap, { y: 8, opacity: 0.01 });
        if (aWrap) gsap.set(aWrap, { y: 10, opacity: 0.01 });

        const tl = gsap.timeline({ paused: true });
        tl.to(
          el,
          {
            y: -6,
            duration: 0.35,
            ease: "power3.out",
            boxShadow: "0 28px 64px rgba(0,0,0,0.48), 0 0 0 1px rgba(201,169,98,0.12)",
          },
          0
        )
          .to(imgWrap, { scale: 1.04, duration: 0.55, ease: "power3.out" }, 0.02)
          .to(bWrap, { y: 0, opacity: 1, duration: 0.32, ease: "power3.out" }, 0.08)
          .to(aWrap, { y: 0, opacity: 1, duration: 0.34, ease: "power3.out" }, 0.14);

        let frame = 0;
        const onEnter = () => tl.play();
        const onFocus = () => tl.play();
        const onLeave = () => tl.reverse();
        const onBlur = () => tl.reverse();
        const onMove = (event: PointerEvent) => {
          if (!allowHeavyFx) return;
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => {
            const rect = el.getBoundingClientRect();
            const px = (event.clientX - rect.left) / rect.width - 0.5;
            const py = (event.clientY - rect.top) / rect.height - 0.5;
            gsap.to(imgWrap, {
              x: px * 10,
              y: py * 8,
              scale: tl.progress() > 0 ? 1.05 : 1.02,
              duration: 0.28,
              ease: "power2.out",
            });
          });
        };

        const onLeaveReset = () => {
          cancelAnimationFrame(frame);
          gsap.to(imgWrap, { x: 0, y: 0, scale: 1, duration: 0.45, ease: "power3.out" });
        };

        el.addEventListener("pointerenter", onEnter);
        el.addEventListener("pointerleave", onLeave);
        el.addEventListener("pointerleave", onLeaveReset);
        el.addEventListener("pointermove", onMove);
        el.addEventListener("focusin", onFocus);
        el.addEventListener("focusout", onBlur);

        cleanup = () => {
          el.removeEventListener("pointerenter", onEnter);
          el.removeEventListener("pointerleave", onLeave);
          el.removeEventListener("pointerleave", onLeaveReset);
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("focusin", onFocus);
          el.removeEventListener("focusout", onBlur);
          cancelAnimationFrame(frame);
          tl.kill();
        };
      } catch {
        // If GSAP can't load for any reason, keep CSS hover behavior only.
      }
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [canAnimate]);

  const badgeItems = [badge, ...badges].filter(Boolean) as string[];

  return (
    <article ref={cardRef} className={`${className ?? ""} ${styles.cardRoot}`} data-magnetic="true">
      <div ref={imageWrapRef} className={imageClassName}>
        {lotTag ? <span className={styles.lotTag}>{lotTag}</span> : null}
        {imageUrl ? (
          <Image src={imageUrl} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" loading="lazy" />
        ) : (
          <div className={styles.placeholder}>No image</div>
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.mainHeader}>
          <div ref={badgesRef} className={styles.badgesRow}>
            {badgeItems.map((item) => (
              <span key={item} className={styles.badge}>
                {item}
              </span>
            ))}
          </div>
        </div>
        <h3 className={styles.title}>
          <Link href={href} className={styles.mainLink}>
            {title}
          </Link>
        </h3>
        {meta ? <p className={styles.meta}>{meta}</p> : null}
        <p className={styles.price}>{price}</p>
        <div ref={actionsRef} className={styles.actionsRow}>
          {enableQuickActions ? (
            <>
              <Link href={quickBuildHref} className={styles.actionPrimary}>
                Commission
              </Link>
              <Link href={quickReserveHref} className={styles.actionSecondary}>
                Reserve
              </Link>
            </>
          ) : null}
          <Link href={href} className={styles.actionGhost}>
            {cta}
          </Link>
        </div>
      </div>
    </article>
  );
}
