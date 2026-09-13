import CandlestickGlow from "@/components/visuals/CandlestickGlow";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-white/70">{children}</div>
    </div>
  );
}

export default function DisclaimerPage() {
  return (
    <div className="relative mx-auto max-w-2xl px-4 py-12">
      <div className="pointer-events-none absolute inset-x-0 -top-4 h-40 opacity-40">
        <CandlestickGlow variant="banner" className="h-full w-full" />
      </div>
      <h1 className="relative font-mono text-xl font-bold tracking-widest text-white">DISCLAIMER</h1>
      <p className="relative mt-1 text-sm text-white/50">Last updated — placeholder, set this when you publish.</p>

      <Section title="Educational Purposes Only">
        <p>
          XRILL Trading Operating System ("XRILL," "we," "us") is an educational trade-planning, journaling, and
          discipline tool. Nothing on this site — including trade alerts, the XRILL Score, setup grades, the
          journal, or any other feature — is or should be construed as personalized investment advice, a
          recommendation to buy or sell any security, option, future, or other financial instrument, or an offer or
          solicitation of any kind. We are not a registered investment adviser, broker-dealer, or commodity trading
          advisor, and no advisory or fiduciary relationship is created by using this site.
        </p>
      </Section>

      <Section title="Hypothetical Performance Disclosure (CFTC Rule 4.41)">
        <p className="rounded border border-caution/30 bg-caution/10 p-3 text-xs uppercase leading-relaxed text-white/70">
          Hypothetical performance results have many inherent limitations, some of which are described below. No
          representation is being made that any account will or is likely to achieve profits or losses similar to
          those shown. In fact, there are frequently sharp differences between hypothetical performance results and
          the actual results subsequently achieved by any particular trading program. One of the limitations of
          hypothetical performance results is that they are generally prepared with the benefit of hindsight. In
          addition, hypothetical trading does not involve financial risk, and no hypothetical trading record can
          completely account for the impact of financial risk in actual trading. For example, the ability to
          withstand losses or to adhere to a particular trading program in spite of trading losses are material
          points which can also adversely affect actual trading results. There are numerous other factors related
          to the markets in general or to the implementation of any specific trading program which cannot be fully
          accounted for in the preparation of hypothetical performance results and all of which can adversely
          affect actual trading results.
        </p>
        <p>
          Any XRILL Score, backtest, setup grade, journal statistic, or milestone shown on this site is hypothetical
          or self-reported and is presented for educational illustration only.
        </p>
      </Section>

      <Section title="Trading Risk">
        <p>
          Trading securities, options, and futures involves substantial risk of loss and is not suitable for every
          investor. You can lose some or all of your invested capital. Past performance — hypothetical, simulated,
          or actual — is not indicative of future results. Only trade with capital you can afford to lose, and
          consider your own financial situation, risk tolerance, and investment objectives before acting on
          anything discussed on this site.
        </p>
      </Section>

      <Section title="Trade Alerts &amp; Discord">
        <p>
          Trade alerts published through XRILL (on the site or via Discord) reflect one person's discretionary,
          educational trade idea at a point in time. They are not personalized to your account, risk tolerance, or
          financial situation, are not monitored or adjusted for you after publication, and may be updated, trimmed,
          or closed at any time without individualized notice beyond what's posted. You are solely responsible for
          any trading decision you make, whether or not it follows an alert.
        </p>
      </Section>

      <Section title="No Guarantee">
        <p>
          We make no guarantee, express or implied, regarding the accuracy, completeness, or profitability of any
          content, score, alert, or tool on this site. Markets are unpredictable, and even a well-scored, fully
          authorized XRILL setup can lose money.
        </p>
      </Section>

      <Section title="Consult a Professional">
        <p>
          This site does not provide legal, tax, or personalized financial advice. Consult a licensed financial
          advisor, broker, or tax professional before making investment decisions.
        </p>
      </Section>

      <p className="mt-10 text-xs text-white/30">
        [Placeholder legal text — have this reviewed by a securities/commodities attorney before relying on it.]
      </p>
    </div>
  );
}
