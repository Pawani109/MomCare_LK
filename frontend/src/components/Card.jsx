/* eslint-disable react/prop-types */

export function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-2xl shadow-sm border border-pink-100 p-5 ${className}`}>{children}</div>;
}

export function SectionTitle({ children }) {
  return <h2 className="text-lg font-semibold text-gray-800 mb-3">{children}</h2>;
}
