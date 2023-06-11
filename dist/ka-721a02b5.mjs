import { g as i, d as l, c as f } from "./index-43e0371a.mjs";
function m(s, a) {
  for (var _ = 0; _ < a.length; _++) {
    const t = a[_];
    if (typeof t != "string" && !Array.isArray(t)) {
      for (const e in t)
        if (e !== "default" && !(e in s)) {
          const o = Object.getOwnPropertyDescriptor(t, e);
          o && Object.defineProperty(s, e, o.get ? o : {
            enumerable: !0,
            get: () => t[e]
          });
        }
    }
  }
  return Object.freeze(Object.defineProperty(s, Symbol.toStringTag, { value: "Module" }));
}
var n = { exports: {} };
(function(s, a) {
  (function(_, t) {
    s.exports = t(l);
  })(f, function(_) {
    function t(r) {
      return r && typeof r == "object" && "default" in r ? r : { default: r };
    }
    var e = t(_), o = { name: "ka", weekdays: "კვირა_ორშაბათი_სამშაბათი_ოთხშაბათი_ხუთშაბათი_პარასკევი_შაბათი".split("_"), weekdaysShort: "კვი_ორშ_სამ_ოთხ_ხუთ_პარ_შაბ".split("_"), weekdaysMin: "კვ_ორ_სა_ოთ_ხუ_პა_შა".split("_"), months: "იანვარი_თებერვალი_მარტი_აპრილი_მაისი_ივნისი_ივლისი_აგვისტო_სექტემბერი_ოქტომბერი_ნოემბერი_დეკემბერი".split("_"), monthsShort: "იან_თებ_მარ_აპრ_მაი_ივნ_ივლ_აგვ_სექ_ოქტ_ნოე_დეკ".split("_"), weekStart: 1, formats: { LT: "h:mm A", LTS: "h:mm:ss A", L: "DD/MM/YYYY", LL: "D MMMM YYYY", LLL: "D MMMM YYYY h:mm A", LLLL: "dddd, D MMMM YYYY h:mm A" }, relativeTime: { future: "%s შემდეგ", past: "%s წინ", s: "წამი", m: "წუთი", mm: "%d წუთი", h: "საათი", hh: "%d საათის", d: "დღეს", dd: "%d დღის განმავლობაში", M: "თვის", MM: "%d თვის", y: "წელი", yy: "%d წლის" }, ordinal: function(r) {
      return r;
    } };
    return e.default.locale(o, null, !0), o;
  });
})(n);
var d = n.exports;
const u = /* @__PURE__ */ i(d), c = /* @__PURE__ */ m({
  __proto__: null,
  default: u
}, [d]);
export {
  c as k
};
