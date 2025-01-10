import { bexApiGraphqlClient } from "@bera/graphql";
import {
  GetValidators,
  GetValidatorsQueryVariables,
  type GetValidatorsQuery,
} from "@bera/graphql/pol/api";

export const getAllValidators = async ({
  variables,
}: {
  variables?: GetValidatorsQueryVariables;
} = {}): Promise<GetValidatorsQuery | undefined> => {
  const result = await bexApiGraphqlClient.query<
    GetValidatorsQuery,
    GetValidatorsQueryVariables
  >({
    query: GetValidators,
    variables,
  });

  return result.data;
};
