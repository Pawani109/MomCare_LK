import { useEffect, useState } from "react";
import { api } from "../api";
import { Card, SectionTitle } from "./Card";
import { useAuth } from "../context/AuthContext";
import RoleNotice from "./RoleNotice";
import { useLanguage } from "../context/LanguageContext";
import { toast } from "react-toastify";
import {
  pregnancyWeeks,
  getPregnancyWeek
} from "../data/pregnancyWeeks";

const PregnancyTracker = () => {
  const { t } = useLanguage();
  const ptxt = t.pregnancy;
  const { user } = useAuth();

  const [tracker, setTracker] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [lmpDate, setLmpDate] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const data = await api.getPregnancy();

    setTracker(data);

    // Get the detailed local week information
    const currentWeekData =
      getPregnancyWeek(data.currentWeek) || pregnancyWeeks[0];

    setSelectedWeek(currentWeekData);
    setLmpDate(data.lmpDate || "");
  };

  useEffect(() => {
    load().catch((error) => {
      setMessage(error.message);
    });
  }, []);

  const saveLmp = async (event) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const data = await api.updatePregnancy({ lmpDate });

      setTracker(data);

      const currentWeekData =
        getPregnancyWeek(data.currentWeek) || pregnancyWeeks[0];

      setSelectedWeek(currentWeekData);

      toast.success(
        ptxt.updated || "Pregnancy dates updated successfully."
      );
    } catch (error) {
      setMessage(error.message);

      toast.error(
        error.message || "Could not update pregnancy details."
      );
    } finally {
      setSaving(false);
    }
  };

  const openWeek = (week) => {
    const weekData = getPregnancyWeek(week);

    if (weekData) {
      setSelectedWeek(weekData);

      // Scroll to the selected week card
      setTimeout(() => {
        document
          .getElementById("week-detail-card")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
      }, 100);
    }
  };

  if (!tracker) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-500">
        {t.loading}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* ================================================= */}
      {/* TOP CURRENT PREGNANCY STATUS */}
      {/* ================================================= */}

      <Card className="relative overflow-hidden !border-0 bg-gradient-to-br from-pink-500 via-pink-600 to-purple-600 text-white shadow-xl shadow-pink-200/50 !py-5">

        <div className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-white/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-purple-300/20 blur-3xl" />

        <div className="relative">

          <p className="text-xs sm:text-sm font-medium text-pink-50/90">
            {ptxt.journey}
          </p>

          <div className="flex flex-wrap items-end justify-between gap-3 mt-1">

            <div>
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Week {tracker.currentWeek}
              </span>

              <span className="ml-2 text-pink-50/80 text-sm">
                + {tracker.currentDay} days
              </span>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs text-pink-50/80">
                {ptxt.estimatedDue}
              </p>

              <p className="font-semibold">
                {tracker.dueDate}
              </p>
            </div>

          </div>

          <div className="mt-4 h-2.5 bg-purple-900/30 rounded-full overflow-hidden">

            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{
                width: `${tracker.progress}%`
              }}
            />

          </div>

          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">

            <span>🌸</span>

            <span>
              {tracker.progress}% of your 40-week journey
            </span>

          </div>

        </div>
      </Card>

      

      {/* ================================================= */}
      {/* UPDATE LMP */}
      {/* ================================================= */}

      {user.role === "mom" && (
        <Card>

          <SectionTitle>
            📅 {ptxt.setDates}
          </SectionTitle>

          <form
            onSubmit={saveLmp}
            className="flex flex-col sm:flex-row gap-3 sm:items-end"
          >

            <label className="flex-1 text-sm text-gray-600">

              First day of last menstrual period (LMP)

              <input
                type="date"
                value={lmpDate}
                max={new Date()
                  .toISOString()
                  .slice(0, 10)}
                onChange={(e) =>
                  setLmpDate(e.target.value)
                }
                required
                className="mt-1 w-full rounded-xl border border-pink-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />

            </label>

            <button
              disabled={saving}
              className="rounded-xl bg-pink-500 px-5 py-2.5 text-white font-medium transition hover:bg-pink-600 disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : ptxt.update}
            </button>

          </form>

          {message && (
            <p className="mt-3 text-sm text-purple-600">
              {message}
            </p>
          )}

        </Card>
      )}

      {/* ================================================= */}
      {/* CURRENT / SELECTED WEEK CARD */}
      {/* This appears above Explore Weeks */}
      {/* ================================================= */}

      {selectedWeek && (
        <div
          id="week-detail-card"
          className="rounded-[28px] overflow-hidden bg-white border border-pink-100 shadow-xl shadow-pink-100/50"
        >

          {/* Week heading */}

          <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 px-5 sm:px-7 py-4 border-b border-pink-100">

            <div className="flex flex-wrap items-center justify-between gap-3">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">
                  Pregnancy Journey
                </p>

                <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-gray-800">
                  Week {selectedWeek.week}
                </h2>

              </div>

              {selectedWeek.week === tracker.currentWeek && (
                <span className="rounded-full bg-pink-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm">
                  Your Current Week
                </span>
              )}

            </div>

          </div>

          <div className="p-4 sm:p-6">

            <div className="grid lg:grid-cols-[1.1fr_2fr] gap-5">

              {/* ========================================= */}
              {/* BABY + FRUIT CARD */}
              {/* ========================================= */}

              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 p-5">

                <div className="absolute top-3 right-4 text-2xl opacity-30">
                  ♡
                </div>

                <div className="flex flex-col items-center text-center">

                  {/* Baby development image */}

                  <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center shadow-inner">

                    <img
                      src={selectedWeek.image}
                      alt={`Baby development at week ${selectedWeek.week}`}
                      className="w-full h-full object-contain p-2"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />

                  </div>

                  <div className="mt-4 rounded-full bg-pink-500 text-white font-semibold px-5 py-1.5 shadow">
                    Week {selectedWeek.week}
                  </div>

                  <p className="mt-4 text-sm text-gray-500">
                    Your baby is about the size of a
                  </p>

                  <div className="mt-1 flex items-center justify-center gap-2">

                    <span className="text-4xl">
                      {selectedWeek.emoji}
                    </span>

                    <h3 className="text-2xl font-bold text-purple-700">
                      {selectedWeek.fruit}
                    </h3>

                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 w-full">

                    <div className="rounded-2xl bg-white/80 border border-pink-100 p-3">

                      <p className="text-xs text-gray-400">
                        Length
                      </p>

                      <p className="font-bold text-gray-700 mt-1">
                        {selectedWeek.size}
                      </p>

                    </div>

                    <div className="rounded-2xl bg-white/80 border border-purple-100 p-3">

                      <p className="text-xs text-gray-400">
                        Weight
                      </p>

                      <p className="font-bold text-gray-700 mt-1">
                        {selectedWeek.weight}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* ========================================= */}
              {/* INFORMATION CARDS */}
              {/* ========================================= */}

              <div className="grid md:grid-cols-3 gap-4">

                {/* Baby Development */}

                <div className="rounded-3xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 p-5">

                  <div className="flex items-center gap-2">

                    <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center text-xl">
                      👶
                    </div>

                    <h3 className="font-bold text-pink-700">
                      Baby Development
                    </h3>

                  </div>

                  <p className="mt-4 text-sm leading-6 text-gray-600">
                    {selectedWeek.baby}
                  </p>

                </div>

                {/* Mother Changes */}

                <div className="rounded-3xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100 p-5">

                  <div className="flex items-center gap-2">

                    <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center text-xl">
                      🤰
                    </div>

                    <h3 className="font-bold text-purple-700">
                      Changes in You
                    </h3>

                  </div>

                  <p className="mt-4 text-sm leading-6 text-gray-600">
                    {selectedWeek.mother}
                  </p>

                </div>

                {/* Clinical guidance */}

                <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 p-5">

                  <div className="flex items-center gap-2">

                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xl">
                      🩺
                    </div>

                    <h3 className="font-bold text-emerald-700">
                      Clinical Guidance
                    </h3>

                  </div>

                  <p className="mt-4 text-sm leading-6 text-gray-600">
                    {selectedWeek.checkup}
                  </p>

                </div>

              </div>

            </div>

            {/* Bottom quote */}

            <div className="mt-5 text-center rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 border border-pink-100 px-4 py-3">

              <p className="text-sm font-medium text-pink-600">
                💗 Every week brings you one step closer to meeting your little one. 💗
              </p>

            </div>

          </div>

        </div>
      )}

      {/* ================================================= */}
      {/* EXPLORE WEEKS */}
      {/* ================================================= */}

      <Card>

        <div className="mb-5">

          <SectionTitle>
            💗 Explore Weeks
          </SectionTitle>

          <p className="text-sm text-gray-500">
            Select a week to see your baby's development,
            size, maternal changes and clinical guidance.
          </p>

        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-3">

          {pregnancyWeeks.map((weekData) => {

            const isSelected =
              selectedWeek?.week === weekData.week;

            const isCurrent =
              tracker.currentWeek === weekData.week;

            return (
              <button
                type="button"
                key={weekData.week}
                onClick={() =>
                  openWeek(weekData.week)
                }
                className={`
                  group relative min-h-[150px]
                  rounded-2xl border p-3
                  flex flex-col items-center
                  justify-between text-center
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:shadow-lg

                  ${
                    isSelected
                      ? "border-purple-500 ring-2 ring-purple-300 bg-purple-50 shadow-lg"
                      : isCurrent
                      ? "border-pink-400 ring-2 ring-pink-200 bg-pink-50"
                      : "border-pink-100 bg-gradient-to-br from-white to-pink-50/50"
                  }
                `}
              >

                {isCurrent && (
                  <span className="absolute -top-2 right-2 rounded-full bg-pink-500 px-2 py-0.5 text-[9px] font-bold text-white">
                    CURRENT
                  </span>
                )}

                <p
                  className={`text-xs font-bold ${
                    isSelected
                      ? "text-purple-700"
                      : "text-pink-600"
                  }`}
                >
                  Week {weekData.week}
                </p>

                <div className="text-4xl my-2 transition-transform duration-300 group-hover:scale-110">
                  {weekData.emoji}
                </div>

                <p className="text-xs font-semibold text-gray-700">
                  {weekData.fruit}
                </p>

                <div className="w-full mt-2 pt-2 border-t border-pink-100">

                  <p className="text-[10px] text-gray-400">
                    {weekData.size}
                  </p>

                  <p className="text-[10px] text-gray-400">
                    {weekData.weight}
                  </p>

                </div>

              </button>
            );
          })}

        </div>

      </Card>

      <p className="text-xs text-center text-gray-400 px-4">
        {ptxt.disclaimer ||
          "Pregnancy development varies between individuals. This tracker provides general educational information and does not replace professional medical advice."}
      </p>

    </div>
  );
};

export default PregnancyTracker;