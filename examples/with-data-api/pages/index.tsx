import useSWR, { Fetcher } from "swr";
import Image from "next/image";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useState } from "react";

export const config = {
  ssr: false,
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const fetcher: Fetcher<any, any> = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => globalThis.fetch(input, init).then((res) => res.json());

interface ResponseData<T> {
  type: "sql_endpoint";
  data: {
    columns: { col: string; data_type: string; nullable: false }[];
    rows: T[];
    result: { code: number };
  };
}

type OrderByYearData = ResponseData<{ order_count: string; year: string }>;
// prettier-ignore
type AvgPriceByYearData = ResponseData<{ price: string; year: string }>;
// prettier-ignore
type TopPriceByYearData = ResponseData<{ price: string; name: string }>;
// prettier-ignore
type OrderByBrandYearData = ResponseData<{ name: string; order_count: string }>;

function RankList({
  data,
  bg,
}: {
  bg: string;
  data: { value: number; name: string }[];
}) {
  return (
    <>
      {data.slice(0, 10).map((i, index, array) => (
        <div
          className="flex justify-between items-center my-1 text-sm relative"
          key={index}
        >
          <div
            className={`absolute top-0 left-0 h-full ${bg}`}
            style={{
              width:
                index === 0
                  ? "100%"
                  : `${(Number(i.value) / Number(array[0].value)) * 100}%`,
              maxWidth: "80%",
            }}
          />
          <div
            className="text-sm p-1 max-w-[80%] break-all truncate block hover:underline cursor-default z-10"
            title={i.name}
          >
            {i.name}
          </div>
          <div>{i.value.toLocaleString("en-US")}</div>
        </div>
      ))}
    </>
  );
}

export default function Home() {
  const [year, setYear] = useState("2017");
  const { data: orderByYearData } = useSWR(
    `/api/gateway/total_order_per_year`,
    fetcher as Fetcher<OrderByYearData, string>,
  );
  const { data: avgPriceByYearData } = useSWR(
    `/api/gateway/avg_price_per_year`,
    fetcher as Fetcher<AvgPriceByYearData, string>,
  );
  const { data: orderByBrandYearData } = useSWR(
    `/api/gateway/order_by_brand_year?year=${year}`,
    fetcher as Fetcher<OrderByBrandYearData, string>,
  );
  const { data: topPriceByYearData } = useSWR(
    `/api/gateway/price_by_brand_year?year=${year}`,
    fetcher as Fetcher<TopPriceByYearData, string>,
  );

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Car Sales Trend",
      },
    },
  };

  const labels = orderByYearData?.data.rows.map((i) => i.year);
  const datasets = [
    {
      data: orderByYearData?.data.rows.map((i) => Number(i.order_count)),
      label: "Number of Orders",
      borderColor: "rgb(53, 162, 235)",
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    },
    {
      data: avgPriceByYearData?.data.rows.map((i) =>
        Math.round(Number(i.price) / 1000),
      ),
      label: "Average Selling Price (K)",
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
  ];

  return (
    <div className="flex flex-col max-w-[780px] min-h-screen mx-auto gap-4 pt-8">
      <header className="text-center font-bold text-xl">
        Insights into Automotive Sales
      </header>
      <div className="shadow-xl bg-white rounded p-4 w-full ">
        <Line options={options} data={{ labels, datasets }} />
      </div>

      <div className="flex gap-4 flex-col md:flex-row md:min-h-[392px]">
        <div className="shadow-xl bg-white rounded p-4 flex-1 flex-shrink-0 md:w-[49%]">
          <header className="flex justify-between">
            <div className="font-bold">Top Brand</div>

            <div className="text-xs flex items-center">
              <span className="font-bold mr-1">Year:</span>
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                {labels?.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          </header>

          <div className="flex justify-between mt-3 mb-2 text-xs font-bold text-gray-500">
            <div>Name</div>
            <div>Order</div>
          </div>
          <RankList
            bg="bg-blue-50"
            data={
              orderByBrandYearData?.data.rows.slice(0, 10).map((i) => ({
                name: i.name,
                value: Number(i.order_count),
              })) ?? []
            }
          />
        </div>

        <div className="shadow-xl bg-white rounded p-4 flex-1 flex-shrink-0 md:w-[49%]">
          <header className="flex justify-between">
            <div className="font-bold">Top Price</div>

            <div className="text-xs flex items-center">
              <span className="font-bold mr-1">Year:</span>
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                {labels?.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          </header>

          <div className="flex justify-between mt-3 mb-2 text-xs font-bold text-gray-500">
            <div>Name</div>
            <div>Price</div>
          </div>
          <RankList
            bg="bg-orange-50"
            data={
              topPriceByYearData?.data.rows.slice(0, 10).map((i) => ({
                name: i.name,
                value: Number(i.price),
              })) ?? []
            }
          />
        </div>
      </div>

      <footer className="flex items-center justify-center mt-4">
        <a
          className="flex gap-2"
          href="https://tidbcloud.com/?utm_source=dataservicedemo&utm_medium=referral"
          target="_blank"
          rel="noopener noreferrer"
          data-mp-event="Click TiDB Cloud Site Link"
        >
          Powered by{" "}
          <Image
            src="/tidb.svg"
            alt="TiDB Cloud Logo"
            width={138}
            height={24}
            priority
          />
        </a>
      </footer>
    </div>
  );
}
