import type { Meta, StoryObj } from "@storybook/react";
import { FormattedNumber } from "../formatted-number";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "BeraUI/FormattedNumber",
  component: FormattedNumber,
  tags: ["autodocs"],
} satisfies Meta<typeof FormattedNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Permutations: Story = {
  args: {
    value: 1,
    compact: false,
    compactThreshold: 999_999_999,
    percent: true,
  },

  render: (args) => {
    const value = Number(args.value.toString());
    return (
      <table className=" border-separate border-spacing-2 table-auto gap-4 space-y-4">
        <thead className="font-bold">
          <tr>
            <th>Multiplier</th>
            <th>Default</th>
            <th>Percentage</th>
            <th>Compact</th>
            <th>Compact Percent</th>
          </tr>
        </thead>
        <tbody>
          {[1, 10, 1e3, -1, -10, -1e3].map((multiplier) => (
            <tr className="my-4 border-b border-border">
              <td className="px-4">{multiplier}</td>
              <td className="px-4">
                <FormattedNumber
                  {...args}
                  percent={false}
                  value={value * multiplier}
                />
              </td>
              <td className="px-4">
                <FormattedNumber
                  {...args}
                  percent
                  value={(value * multiplier) / 100}
                />
              </td>
              <td className="px-4">
                <FormattedNumber {...args} compact value={value * multiplier} />
              </td>
              <td className="px-4">
                <FormattedNumber
                  {...args}
                  compact
                  percent
                  value={(value * multiplier) / 100}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
};
