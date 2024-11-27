import { SafeTab } from '@/src/components/SafeTab'
import { AssetsCard } from '@/src/components/transactions-list/Card/AssetsCard'
import { POLLING_INTERVAL } from '@/src/config/constants'
import { selectActiveSafe } from '@/src/store/activeSafeSlice'
import { Balance, useBalancesGetBalancesV1Query } from '@/src/store/gateway/AUTO_GENERATED/balances'
import { formatValue } from '@/src/utils/formatters'
import React from 'react'
import { ListRenderItem } from 'react-native'
import { useSelector } from 'react-redux'
import { Text } from 'tamagui'
import { selectActiveChain } from '@/src/store/activeChainSlice'
import Fallback from '../Fallback'

function Tokens() {
  const activeSafe = useSelector(selectActiveSafe)
  const activeChain = useSelector(selectActiveChain)

  const { data, isLoading, error } = useBalancesGetBalancesV1Query(
    {
      chainId: activeChain?.chainId,
      fiatCode: 'USD',
      safeAddress: activeSafe.address,
      excludeSpam: false,
      trusted: true,
    },
    {
      pollingInterval: POLLING_INTERVAL,
    },
  )

  const renderItem: ListRenderItem<Balance> = React.useCallback(({ item }) => {
    return (
      <AssetsCard
        name={item.tokenInfo.name}
        logoUri={item.tokenInfo.logoUri}
        description={`${formatValue(item.balance, item.tokenInfo.decimals as number)} ${item.tokenInfo.symbol}`}
        rightNode={
          <Text fontSize="$4" fontWeight={400} color="$color">
            ${item.fiatBalance}
          </Text>
        }
      />
    )
  }, [])

  if (isLoading || !data?.items.length || error) {
    return <Fallback loading={isLoading} hasError={!!error} />
  }

  return (
    <SafeTab.FlatList<Balance>
      data={data?.items}
      renderItem={renderItem}
      keyExtractor={(item, index): string => item.tokenInfo.name + index}
    />
  )
}

export default Tokens
