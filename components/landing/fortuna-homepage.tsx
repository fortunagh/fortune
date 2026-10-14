"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";

import "./fortuna.css";

type FortunaHomepageProps = {
  onRequestAccess?: () => void;
};

export function FortunaHomepage({ onRequestAccess }: FortunaHomepageProps) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    const sync = () => {
      const menu = root.current?.querySelector<HTMLDetailsElement>(".navigation");
      if (menu) menu.open = !media.matches;
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    if (!(event.target instanceof Element)) return;
    const action = event.target.closest("a, button");
    if (!action) return;
    if (
      action.hasAttribute("data-request-access") &&
      onRequestAccess &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      event.preventDefault();
      onRequestAccess();
    }
    if (window.matchMedia("(max-width: 700px)").matches) {
      const menu = root.current?.querySelector<HTMLDetailsElement>(".navigation");
      if (menu) menu.open = false;
    }
  }

  return (
    <div className="fortuna-site" onClick={handleClick} ref={root}>
      <div className="page">
        <a className="skip" href="#main">
          Skip to content
        </a>
        <header className="header">
          <Link
            className="logo"
            href="/"
            aria-label="Fortuna Global Holdings — Building Infinite Abundance"
          >
            <Image
              src="/fortuna/logo-header.png"
              alt=""
              width={335}
              height={86}
              priority
            />
          </Link>
          <details className="navigation" open>
            <summary>
              Menu <span aria-hidden="true">☰</span>
            </summary>
            <nav aria-label="Main navigation">
              <a href="#approach">Our Approach</a>
              <a href="#opportunities">Opportunities</a>
              <a href="#collective">The Collective</a>
              <button
                type="button"
                className="button"
                data-request-access="true"
              >
                Request Access
              </button>
            </nav>
          </details>
        </header>
        <main id="main">
          <section className="hero scene" aria-labelledby="hero-title">
            <div className="hero-copy">
              <p className="eyebrow">Building</p>
              <h1 id="hero-title">
                Infinite
                <br />
                <span>Abundance</span>
              </h1>
              <div className="rule" />
              <p className="hero-tagline">
                Opportunity is the vehicle.
                <br />
                Abundance is the vision.
                <br />
                Impact is the legacy.
              </p>
            </div>
            <ul className="ingredients" aria-label="Elements of opportunity">
              <li>People</li>
              <li>Capital</li>
              <li>Capability</li>
              <li>Structure</li>
              <li>Systems</li>
              <li>Relationships</li>
              <li>Opportunity</li>
            </ul>
            <div
              className="mobile-art hero-art"
              role="img"
              aria-label="Open gold vault revealing a sunlit city skyline"
            />
          </section>

          <section
            id="opportunities"
            className="belief scene"
            aria-labelledby="belief-title"
          >
            <div className="belief-copy">
              <p className="eyebrow">Our Belief</p>
              <h2 id="belief-title">
                Extraordinary outcomes
                <br />
                begin with <em>alignment.</em>
              </h2>
              <div className="rule" />
              <p>
                We don’t simply seek opportunity. We seek alignment — between
                exceptional people and exceptional opportunities.
              </p>
              <p>
                Fortuna identifies and pursues opportunities with the potential
                to create meaningful value and lasting abundance, bringing
                together the right people, capital, capability, structure,
                systems and relationships to turn possibility into reality.
              </p>
            </div>
            <div
              className="mobile-art globe-art"
              role="img"
              aria-label="Dark black-and-gold globe with orbital rings, without text"
            />
          </section>

          <section
            id="collective"
            className="collective scene"
            aria-labelledby="collective-title"
          >
            <div className="statement">
              <h2>
                Not
                <br />
                everything
                <br />
                is built
                <br />
                <span>for everyone.</span>
              </h2>
            </div>
            <div className="collective-copy">
              <h2 id="collective-title">
                Neither is <span>Fortuna.</span>
              </h2>
              <div className="rule" />
              <p>
                We are a select collective of entrepreneurial, business-minded
                individuals who think differently, contribute meaningfully and
                are driven to grow, evolve and create.
              </p>
              <p>
                The value of the collective is not defined by how many people
                are part of it. It is defined by who they are.
              </p>
            </div>
          </section>

          <section
            id="approach"
            className="approach scene"
            aria-labelledby="approach-title"
          >
            <div className="approach-copy">
              <p className="eyebrow">Our Approach</p>
              <h2 id="approach-title">Identify. Align. Create.</h2>
              <div className="rule" />
              <p>
                We look beyond what already exists to what could exist —
                identifying opportunities with the potential to create
                abundance, and aligning the people, resources and strategies
                required to bring them to life.
              </p>
            </div>
            <div className="steps">
              <div>
                <svg viewBox="0 0 80 80" aria-hidden="true">
                  <path d="m40 4 9 27 27 9-27 9-9 27-9-27-27-9 27-9zM40 4v72M4 40h72M20 20l40 40m0-40L20 60M40 4l-9 27 18 18-9 27M4 40l27-9 18 18 27-9" />
                </svg>
                <p>
                  Identify
                  <br />
                  Opportunity
                </p>
              </div>
              <div>
                <svg viewBox="0 0 80 80" aria-hidden="true">
                  <circle cx="29" cy="40" r="24" />
                  <circle cx="51" cy="40" r="24" />
                </svg>
                <p>
                  Create
                  <br />
                  Alignment
                </p>
              </div>
              <div>
                <svg viewBox="0 0 80 80" aria-hidden="true">
                  <path d="m40 8 34 54H6zM29 25h22M18 43h44M6 62l45-37M18 43l22-18" />
                </svg>
                <p>
                  Unlock
                  <br />
                  Possibility
                </p>
              </div>
            </div>
          </section>

          <section className="purpose scene" aria-labelledby="purpose-title">
            <div
              className="mobile-art armillary-art"
              role="img"
              aria-label="Gold armillary sculpture in a sunlit cream marble interior"
            />
            <div className="purpose-copy">
              <p className="eyebrow">Our Purpose</p>
              <h2 id="purpose-title">
                Opportunity creates abundance.
                <br />
                Abundance creates possibility.
                <br />
                Possibility creates <em>impact.</em>
              </h2>
              <div className="rule" />
            </div>
            <div className="access-copy">
              <p className="eyebrow">Access is selective</p>
              <p>
                If this resonates,
                <br />
                the conversation begins here.
              </p>
            </div>
            <div className="access-cta">
              <p>
                Private Consideration
                <br />
                Limited Availability
              </p>
              <button
                type="button"
                className="button"
                data-request-access="true"
              >
                Request Access <span aria-hidden="true">⟶</span>
              </button>
            </div>
          </section>
        </main>
        <footer>
          <Link href="/privacy-policy">Privacy policy</Link>
          <Link href="/terms-and-conditions">Terms &amp; conditions</Link>
          <Link href="/auth/login">Private sign in</Link>
          <span>© Fortuna Global Holdings 2026</span>
        </footer>
      </div>
    </div>
  );
}
