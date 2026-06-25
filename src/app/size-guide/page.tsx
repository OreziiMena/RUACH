"use client";

import { useState } from "react";
import styles from "./size-guide.module.css";

// --- DATA EXTRACTED FROM CHARTS ---
const menTops = [
  { size: "S", chest: "42", shoulder: "19", length: "27.5", sleeve: "8.5" },
  { size: "M", chest: "44", shoulder: "20", length: "28.5", sleeve: "9" },
  { size: "L", chest: "46", shoulder: "21", length: "30", sleeve: "9.5" },
  { size: "XL", chest: "49", shoulder: "22", length: "31", sleeve: "10" },
  { size: "XXL", chest: "51", shoulder: "23", length: "32", sleeve: "10.5" },
  { size: "3XL", chest: "54", shoulder: "24", length: "33", sleeve: "11" },
  { size: "4XL", chest: "57", shoulder: "25", length: "34", sleeve: "11.5" },
];

const menBottoms = [
  { size: "S", waist: "29-31", hip: "40", length: "40", ankle: "8.5" },
  { size: "M", waist: "31-33", hip: "42", length: "41", ankle: "9" },
  { size: "L", waist: "33-35", hip: "44", length: "42", ankle: "9.5" },
  { size: "XL", waist: "35-37", hip: "46", length: "43", ankle: "10" },
  { size: "XXL", waist: "37-39", hip: "48", length: "43.5", ankle: "10.5" },
  { size: "3XL", waist: "39-41", hip: "50", length: "44", ankle: "11" },
  { size: "4XL", waist: "41-43", hip: "52", length: "44.5", ankle: "11.5" },
];

const womenTops = [
  { size: "XS", bust: "34", shoulder: "15", length: "24", sleeve: "7.5" },
  { size: "S", bust: "36", shoulder: "16", length: "25", sleeve: "8" },
  { size: "M", bust: "38", shoulder: "17", length: "26", sleeve: "8.5" },
  { size: "L", bust: "40", shoulder: "18", length: "27", sleeve: "9" },
  { size: "XL", bust: "43", shoulder: "19", length: "28", sleeve: "9.5" },
  { size: "XXL", bust: "46", shoulder: "20", length: "29", sleeve: "10" },
  { size: "3XL", bust: "49", shoulder: "21", length: "30", sleeve: "10.5" },
  { size: "4XL", bust: "52", shoulder: "22", length: "31", sleeve: "11" },
];

const womenBottoms = [
  { size: "XS", waist: "24-26", hip: "36", length: "39", ankle: "7" },
  { size: "S", waist: "26-28", hip: "38", length: "40", ankle: "7.5" },
  { size: "M", waist: "28-30", hip: "40", length: "41", ankle: "8" },
  { size: "L", waist: "30-32", hip: "42", length: "42", ankle: "8.5" },
  { size: "XL", waist: "32-35", hip: "45", length: "43", ankle: "9" },
  { size: "XXL", waist: "35-38", hip: "48", length: "43.5", ankle: "9.5" },
  { size: "3XL", waist: "38-41", hip: "51", length: "44", ankle: "10" },
  { size: "4XL", waist: "41-44", hip: "54", length: "44.5", ankle: "10.5" },
];

export default function SizeGuide() {
  const [activeTab, setActiveTab] = useState<"men" | "women">("men");

  return (
      <div className={styles.container}>

        <header className={styles.header}>
          <h1 className={styles.title}> Size Guide</h1>
          <p className={styles.subtitle}>All measurements are in inches.</p>
        </header>

      <div className={styles.tabContainer}>
        <button
          onClick={() => setActiveTab("men")}
          className={`${styles.tabBtn} ${activeTab === "men" ? styles.active : ""}`}
        >
          Men&apos;s Sizes
        </button>
        <button
          onClick={() => setActiveTab("women")}
          className={`${styles.tabBtn} ${activeTab === "women" ? styles.active : ""}`}
        >
          Women&apos;s Sizes
        </button>
      </div>

      {/* MEN'S SECTION */}
      {activeTab === "men" && (
        <div className={styles.tablesWrapper}>
          <section className={styles.tableSection}>
            <h2>Tops / Tees / Hoodies</h2>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest</th>
                    <th>Shoulder</th>
                    <th>Length</th>
                    <th>Sleeve</th>
                  </tr>
                </thead>
                <tbody>
                  {menTops.map((row) => (
                    <tr key={row.size}>
                      <td>{row.size}</td>
                      <td>{row.chest}</td>
                      <td>{row.shoulder}</td>
                      <td>{row.length}</td>
                      <td>{row.sleeve}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.tableSection}>
            <h2>Bottoms / Pants</h2>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Waist</th>
                    <th>Hip</th>
                    <th>Length</th>
                    <th>Ankle</th>
                  </tr>
                </thead>
                <tbody>
                  {menBottoms.map((row) => (
                    <tr key={row.size}>
                      <td>{row.size}</td>
                      <td>{row.waist}</td>
                      <td>{row.hip}</td>
                      <td>{row.length}</td>
                      <td>{row.ankle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* WOMEN'S SECTION */}
      {activeTab === "women" && (
        <div className={styles.tablesWrapper}>
          <section className={styles.tableSection}>
            <h2>Women&apos;s Tops / Tees / Hoodies</h2>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Bust</th>
                    <th>Shoulder</th>
                    <th>Length</th>
                    <th>Sleeve</th>
                  </tr>
                </thead>
                <tbody>
                  {womenTops.map((row) => (
                    <tr key={row.size}>
                      <td>{row.size}</td>
                      <td>{row.bust}</td>
                      <td>{row.shoulder}</td>
                      <td>{row.length}</td>
                      <td>{row.sleeve}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.tableSection}>
            <h2>Women&apos;s Bottoms / Pants</h2>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Waist</th>
                    <th>Hip</th>
                    <th>Length</th>
                    <th>Ankle</th>
                  </tr>
                </thead>
                <tbody>
                  {womenBottoms.map((row) => (
                    <tr key={row.size}>
                      <td>{row.size}</td>
                      <td>{row.waist}</td>
                      <td>{row.hip}</td>
                      <td>{row.length}</td>
                      <td>{row.ankle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
        </div>
  );
}