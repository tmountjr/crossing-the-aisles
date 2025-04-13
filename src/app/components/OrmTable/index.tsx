/* eslint-disable @typescript-eslint/no-explicit-any */

interface OrmTableProps {
  data: Record<string, any>[];
  headers: Record<string, string>;
  title?: string;
}

const OrmTable: React.FC<OrmTableProps> = ({ data, headers, title }) => {
  return (
    <div className="overflow-x-auto flex flex-col gap-4">
      {title && <p>{title}</p>}
      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-600 text-white">
            {Object.values(headers).map((header) => (
              <th
                key={header}
                className="px-4 py-2 text-left text-sm font-bold tracking-wide break-words"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`${rowIndex % 2 === 0 ? "bg-white" : "bg-gray-100"}`}
            >
              {Object.keys(headers).map((key) => (
                <td
                  key={key}
                  className="px-4 py-2 text-sm text-gray-800 align-middle break-words"
                >
                  {row[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrmTable;
