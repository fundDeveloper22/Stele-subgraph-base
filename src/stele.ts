import {
  AddToken as AddTokenEvent,
  Claim as ClaimEvent,
  Create as CreateEvent,
  DebugJoin as DebugJoinEvent,
  DebugTokenPrice as DebugTokenPriceEvent,
  EntryFee as EntryFeeEvent,
  Join as JoinEvent,
  MaxAssets as MaxAssetsEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Register as RegisterEvent,
  RemoveToken as RemoveTokenEvent,
  RewardRatio as RewardRatioEvent,
  SeedMoney as SeedMoneyEvent,
  Swap as SwapEvent
} from "../generated/Stele/Stele"
import {
  AddToken,
  Claim,
  Create,
  DebugJoin,
  DebugTokenPrice,
  EntryFee,
  Join,
  MaxAssets,
  OwnershipTransferred,
  Register,
  RemoveToken,
  RewardRatio,
  SeedMoney,
  Swap
} from "../generated/schema"

export function handleAddToken(event: AddTokenEvent): void {
  let entity = new AddToken(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenAddress = event.params.tokenAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleClaim(event: ClaimEvent): void {
  let entity = new Claim(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.challengeId = event.params.challengeId
  entity.user = event.params.user
  entity.rewardAmount = event.params.rewardAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCreate(event: CreateEvent): void {
  let entity = new Create(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.challengeId = event.params.challengeId
  entity.challengeType = event.params.challengeType
  entity.startTime = event.params.startTime
  entity.endTime = event.params.endTime

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDebugJoin(event: DebugJoinEvent): void {
  let entity = new DebugJoin(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenAddress = event.params.tokenAddress
  entity.amount = event.params.amount
  entity.totalRewards = event.params.totalRewards

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDebugTokenPrice(event: DebugTokenPriceEvent): void {
  let entity = new DebugTokenPrice(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.baseToken = event.params.baseToken
  entity.baseAmount = event.params.baseAmount
  entity.quoteToken = event.params.quoteToken
  entity.quoteAmount = event.params.quoteAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleEntryFee(event: EntryFeeEvent): void {
  let entity = new EntryFee(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newEntryFee = event.params.newEntryFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleJoin(event: JoinEvent): void {
  let entity = new Join(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.challengeId = event.params.challengeId
  entity.user = event.params.user

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMaxAssets(event: MaxAssetsEvent): void {
  let entity = new MaxAssets(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newMaxAssets = event.params.newMaxAssets

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRegister(event: RegisterEvent): void {
  let entity = new Register(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.challengeId = event.params.challengeId
  entity.user = event.params.user
  entity.performance = event.params.performance

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRemoveToken(event: RemoveTokenEvent): void {
  let entity = new RemoveToken(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenAddress = event.params.tokenAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRewardRatio(event: RewardRatioEvent): void {
  let entity = new RewardRatio(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newRewardDistribution = event.params.newRewardDistribution

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSeedMoney(event: SeedMoneyEvent): void {
  let entity = new SeedMoney(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newSeedMoney = event.params.newSeedMoney

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSwap(event: SwapEvent): void {
  let entity = new Swap(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.challengeId = event.params.challengeId
  entity.user = event.params.user
  entity.fromAsset = event.params.fromAsset
  entity.toAsset = event.params.toAsset
  entity.fromAmount = event.params.fromAmount
  entity.fromPriceUSD = event.params.fromPriceUSD
  entity.toPriceUSD = event.params.toPriceUSD
  entity.toAmount = event.params.toAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
