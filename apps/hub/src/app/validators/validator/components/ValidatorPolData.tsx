import { SimpleTable, useAsyncTable } from "@bera/shared-ui";

import GlobalGaugeWeightChart from "~/components/global-gauge-weight-chart";
import { getValidatorGaugeColumns } from "~/columns/validator-gauge-columns";
import { ApiValidatorFragment } from "@bera/graphql/pol/api";

export const ValidatorPolData = ({
  validator,
}: { validator: ApiValidatorFragment }) => {
  const gaugesTable = useAsyncTable({
    fetchData: async () => {},
    columns: getValidatorGaugeColumns(validator),
    data: validator.rewardAllocationWeights ?? [],
    additionalTableProps: {
      manualSorting: false,
      meta: {
        loadingText: "Loading...",
      },
    },
  });

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-6">
      <SimpleTable
        table={gaugesTable}
        // variant="ghost"
        wrapperClassName={"w-full"}
        flexTable
        dynamicFlex
        showToolbar={false}
      />
      <GlobalGaugeWeightChart
        gaugeWeights={validator?.rewardAllocationWeights}
        isLoading={false}
      />
    </div>
  );
};
