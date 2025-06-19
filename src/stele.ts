import {
  AddToken as AddTokenEvent,
  Reward as RewardEvent,
  Create as CreateEvent,
  EntryFee as EntryFeeEvent,
  Join as JoinEvent,
  MaxAssets as MaxAssetsEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Register as RegisterEvent,
  RemoveToken as RemoveTokenEvent,
  RewardRatio as RewardRatioEvent,
  SeedMoney as SeedMoneyEvent,
  Swap as SwapEvent,
  SteleCreated as SteleCreatedEvent,
  Stele as SteleContract,
  SteleTokenBonus as SteleTokenBonusEvent
} from "../generated/Stele/Stele"
import {
  Reward,
  Create,
  Join,
  Register,
  Swap,
  InvestableToken,
  Stele,
  Challenge,
  ChallengeSnapshot,
  ActiveChallengesSnapshot,
  Investor,
  ActiveChallenges,
  SteleTokenBonus,
  Ranking,
  TotalRanking
} from "../generated/schema"
import { BigInt, BigDecimal, Bytes, log, Address } from "@graphprotocol/graph-ts"
import { ChallengeType, getDuration, STELE_ADDRESS } from "./utils/constants"
import { ERC20 } from "../generated/Stele/ERC20"
import { activeChallengesSnapshot, challengeSnapshot, investorSnapshot } from "./utils/snapshots"
import { getCachedEthPriceUSD, getCachedTokenPriceETH, getTokenPriceETH } from "./utils/pricing"
import { getInvestorID } from "./utils/investor"
import { fetchTokenDecimals, fetchTokenSymbol } from "./utils/token"
import { exponentToBigDecimal } from "./utils"

export function handleSteleCreated(event: SteleCreatedEvent): void {
  let stele = new Stele(Bytes.fromI32(0))
  stele.owner = event.params.owner
  stele.usdToken = event.params.usdToken
  stele.rewardRatio = event.params.rewardRatio
  let usdTokenDecimals = fetchTokenDecimals(stele.usdToken, event.block.timestamp)
  if (usdTokenDecimals !== null) {
    let decimalDivisor = exponentToBigDecimal(usdTokenDecimals)
    stele.seedMoney = event.params.seedMoney.div(BigInt.fromString(decimalDivisor.toString()))
    stele.entryFee = event.params.entryFee.div(BigInt.fromString(decimalDivisor.toString()))
  } else {
    log.error('[STELE_CREATED] Failed to get decimals for USD token, using raw value: {}', [stele.usdToken.toHexString()])
    stele.seedMoney = event.params.seedMoney
    stele.entryFee = event.params.entryFee
  }
  stele.maxAssets = event.params.maxAssets
  stele.challengeCounter= BigInt.fromI32(0)
  stele.investorCounter = BigInt.fromI32(0)
  stele.save()

  let activeChallenges = new ActiveChallenges(Bytes.fromI32(0))
  activeChallenges.id = Bytes.fromI32(0)
  activeChallenges.one_week_id = "0"
  activeChallenges.one_week_startTime = BigInt.fromI32(0)
  activeChallenges.one_week_endTime = BigInt.fromI32(0)
  activeChallenges.one_week_investorCounter = BigInt.fromI32(0)
  activeChallenges.one_week_rewardAmountUSD = BigInt.fromI32(0)
  activeChallenges.one_week_isCompleted = true
  activeChallenges.one_month_id = "0"
  activeChallenges.one_month_startTime = BigInt.fromI32(0)
  activeChallenges.one_month_endTime = BigInt.fromI32(0)
  activeChallenges.one_month_investorCounter = BigInt.fromI32(0)
  activeChallenges.one_month_rewardAmountUSD = BigInt.fromI32(0)
  activeChallenges.one_month_isCompleted = true
  activeChallenges.three_month_id = "0"
  activeChallenges.three_month_startTime = BigInt.fromI32(0)
  activeChallenges.three_month_endTime = BigInt.fromI32(0)
  activeChallenges.three_month_investorCounter = BigInt.fromI32(0)
  activeChallenges.three_month_rewardAmountUSD = BigInt.fromI32(0)
  activeChallenges.three_month_isCompleted = true
  activeChallenges.six_month_id = "0"
  activeChallenges.six_month_startTime = BigInt.fromI32(0)
  activeChallenges.six_month_endTime = BigInt.fromI32(0)
  activeChallenges.six_month_investorCounter = BigInt.fromI32(0)
  activeChallenges.six_month_rewardAmountUSD = BigInt.fromI32(0)
  activeChallenges.six_month_isCompleted = true
  activeChallenges.one_year_id = "0"
  activeChallenges.one_year_startTime = BigInt.fromI32(0)
  activeChallenges.one_year_endTime = BigInt.fromI32(0)
  activeChallenges.one_year_investorCounter = BigInt.fromI32(0)
  activeChallenges.one_year_rewardAmountUSD = BigInt.fromI32(0)
  activeChallenges.one_year_isCompleted = true
  activeChallenges.save()
}

export function handleAddToken(event: AddTokenEvent): void {
  let investableToken = InvestableToken.load(event.params.tokenAddress)
  if (!investableToken) {
    investableToken = new InvestableToken(event.params.tokenAddress)
    investableToken.tokenAddress = event.params.tokenAddress
    
    let decimals = fetchTokenDecimals(event.params.tokenAddress, event.block.timestamp)
    if (decimals === null) {
      log.debug('the decimals on {} token was null', [event.params.tokenAddress.toHexString()])
      return
    }
    investableToken.decimals = decimals
    investableToken.symbol = fetchTokenSymbol(event.params.tokenAddress, event.block.timestamp)
    investableToken.isInvestable = true
    investableToken.updatedTimestamp = event.block.timestamp
    investableToken.save()
  } else {
    investableToken.isInvestable = true
    investableToken.updatedTimestamp = event.block.timestamp
    investableToken.save()
  }
}

export function handleRemoveToken(event: RemoveTokenEvent): void {
  let investableToken = InvestableToken.load(event.params.tokenAddress)
  if (investableToken != null) {
    investableToken.isInvestable = false
    investableToken.updatedTimestamp = event.block.timestamp
    investableToken.save()
  }
}

export function handleRewardRatio(event: RewardRatioEvent): void {
  let stele = Stele.load(Bytes.fromI32(0))
  if (stele != null) {
    stele.rewardRatio = event.params.newRewardRatio
    stele.save()
  }
}

export function handleSeedMoney(event: SeedMoneyEvent): void {
  let stele = Stele.load(Bytes.fromI32(0))
  if (stele != null) {
    let usdTokenDecimals = fetchTokenDecimals(stele.usdToken, event.block.timestamp)
    if (usdTokenDecimals !== null) {
      let decimalDivisor = exponentToBigDecimal(usdTokenDecimals)
      stele.seedMoney = event.params.newSeedMoney.div(BigInt.fromString(decimalDivisor.toString()))
    }
    else {
      log.error('[STELE_CREATED] Failed to get decimals for USD token, using raw value: {}', [stele.usdToken.toHexString()])
      stele.seedMoney = event.params.newSeedMoney
    }
    stele.save()
  }
}

export function handleEntryFee(event: EntryFeeEvent): void {
  let stele = Stele.load(Bytes.fromI32(0))
  if (stele != null) {
    let usdTokenDecimals = fetchTokenDecimals(stele.usdToken, event.block.timestamp)
    if (usdTokenDecimals !== null) {
      let decimalDivisor = exponentToBigDecimal(usdTokenDecimals)
      stele.entryFee = event.params.newEntryFee.div(BigInt.fromString(decimalDivisor.toString()))
    }
    else {
      log.error('[STELE_CREATED] Failed to get decimals for USD token, using raw value: {}', [stele.usdToken.toHexString()])
      stele.entryFee = event.params.newEntryFee
    }
    stele.save()
  }
}

export function handleMaxAssets(event: MaxAssetsEvent): void {
  let stele = Stele.load(Bytes.fromI32(0))
  if (stele != null) {
    stele.maxAssets = event.params.newMaxAssets
    stele.save()
  }
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let stele = Stele.load(Bytes.fromI32(0))
  if (stele != null) {
    stele.owner = event.params.newOwner
    stele.save()
  }
}

export function handleCreate(event: CreateEvent): void {
  let create = new Create(event.transaction.hash.concatI32(event.logIndex.toI32()))
  create.challengeId = event.params.challengeId
  create.challengeType = event.params.challengeType
  create.blockNumber = event.block.number
  create.blockTimestamp = event.block.timestamp
  create.transactionHash = event.transaction.hash
  create.save()

  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400 // rounded
  
  // create stele snapshot
  let stele = Stele.load(Bytes.fromI32(0))
  if (stele == null) {
    log.debug('[CREATE] Stele not found, Stele : {}', [STELE_ADDRESS])
    return
  }
  stele.challengeCounter = stele.challengeCounter.plus(BigInt.fromI32(1))
  stele.save()

  // Create challenge and challenge snapshot
  let challenge = new Challenge(
    event.params.challengeId.toString()
  )
  challenge.challengeId = event.params.challengeId.toString()
  challenge.challengeType = create.challengeType
  challenge.startTime = event.block.timestamp
  challenge.endTime = challenge.startTime.plus(getDuration(event.params.challengeType))
  challenge.investorCounter = BigInt.fromI32(0)
  let usdTokenDecimals = fetchTokenDecimals(stele.usdToken, event.block.timestamp)
  if (usdTokenDecimals !== null) {
    let decimalDivisor = exponentToBigDecimal(usdTokenDecimals)
    challenge.seedMoney = event.params.seedMoney.div(BigInt.fromString(decimalDivisor.toString()))
    challenge.entryFee = event.params.entryFee.div(BigInt.fromString(decimalDivisor.toString()))
  } else {
    log.error('[CHALLENGE_CREATED] Failed to get decimals for USD token, using raw value: {}', [stele.usdToken.toHexString()])
    challenge.seedMoney = event.params.seedMoney
    challenge.entryFee = event.params.entryFee
  }
  challenge.rewardAmountUSD = BigInt.fromI32(0)
  challenge.isActive = true
  challenge.topUsers = []
  challenge.score = []
  challenge.save()

  // Use the challengeSnapshot helper function instead of duplicating logic
  challengeSnapshot(event.params.challengeId.toString(), event)

  let activeChallenges = ActiveChallenges.load(Bytes.fromI32(0))
  if (activeChallenges == null) {
    log.debug('[CREATE] ActiveChallenges not found, ChallengeId : {}', [event.params.challengeId.toString()])
    return
  }
  switch (challenge.challengeType) {
    case ChallengeType.OneWeek:
      activeChallenges.one_week_id = event.params.challengeId.toString()
      activeChallenges.one_week_startTime = challenge.startTime
      activeChallenges.one_week_endTime = challenge.endTime
      activeChallenges.one_week_investorCounter = BigInt.fromI32(0)
      activeChallenges.one_week_rewardAmountUSD = BigInt.fromI32(0)
      activeChallenges.one_week_isCompleted = false
      break;
    case ChallengeType.OneMonth:
      activeChallenges.one_month_id = event.params.challengeId.toString()
      activeChallenges.one_month_startTime = challenge.startTime
      activeChallenges.one_month_endTime = challenge.endTime
      activeChallenges.one_month_investorCounter = BigInt.fromI32(0)
      activeChallenges.one_month_rewardAmountUSD = BigInt.fromI32(0)
      activeChallenges.one_month_isCompleted = false
      break;
    case ChallengeType.ThreeMonths:
      activeChallenges.three_month_id = event.params.challengeId.toString()
      activeChallenges.three_month_startTime = challenge.startTime
      activeChallenges.three_month_endTime = challenge.endTime
      activeChallenges.three_month_investorCounter = BigInt.fromI32(0)
      activeChallenges.three_month_rewardAmountUSD = BigInt.fromI32(0)
      activeChallenges.three_month_isCompleted = false
      break;
    case ChallengeType.SixMonths:
      activeChallenges.six_month_id = event.params.challengeId.toString()
      activeChallenges.six_month_startTime = challenge.startTime
      activeChallenges.six_month_endTime = challenge.endTime
      activeChallenges.six_month_investorCounter = BigInt.fromI32(0)
      activeChallenges.six_month_rewardAmountUSD = BigInt.fromI32(0)
      activeChallenges.six_month_isCompleted = false
      break;
    case ChallengeType.OneYear:
      activeChallenges.one_year_id = event.params.challengeId.toString()
      activeChallenges.one_year_startTime = challenge.startTime
      activeChallenges.one_year_endTime = challenge.endTime
      activeChallenges.one_year_investorCounter = BigInt.fromI32(0)
      activeChallenges.one_year_rewardAmountUSD = BigInt.fromI32(0)
      activeChallenges.one_year_isCompleted = false
      break;
    default:
      break;
  }
  activeChallenges.save()
  activeChallengesSnapshot(event)
}

export function handleJoin(event: JoinEvent): void {
  let join = new Join(event.transaction.hash.concatI32(event.logIndex.toI32()))
  join.challengeId = event.params.challengeId
  join.user = event.params.user
  join.seedMoney = event.params.seedMoney
  join.blockNumber = event.block.number
  join.blockTimestamp = event.block.timestamp
  join.transactionHash = event.transaction.hash
  join.save()

  // Update Stele
  let stele = Stele.load(Bytes.fromI32(0))
  if (stele == null) {
    log.debug('[JOIN] Stele not found, Stele : {}', [STELE_ADDRESS])
    return
  }
  stele.investorCounter = stele.investorCounter.plus(BigInt.fromI32(1))
  stele.save()

  // Update Challenge and create ChallengeSnapshot
  let challenge = Challenge.load(event.params.challengeId.toString())
  if (challenge == null) {
    log.debug('[JOIN] Challenge not found, Challenge : {}', [event.params.challengeId.toString()])
    return
  }
  challenge.investorCounter = challenge.investorCounter.plus(BigInt.fromI32(1))
  challenge.rewardAmountUSD = challenge.rewardAmountUSD.plus(challenge.entryFee)
  challenge.save()

  challengeSnapshot(event.params.challengeId.toString(), event)

  // Create new Investor and InvestorSnapshot
  let investor = new Investor(getInvestorID(event.params.challengeId, event.params.user))
  investor.challengeId = event.params.challengeId.toString()
  investor.createdAtTimestamp = event.block.timestamp
  investor.endTime = challenge.endTime
  investor.updatedAtTimestamp = event.block.timestamp
  investor.investor = event.params.user
  investor.seedMoneyUSD = BigDecimal.fromString(event.params.seedMoney.toString())
  investor.currentUSD = investor.seedMoneyUSD  // At join time, current value equals seed money
  investor.tokens = [stele.usdToken]  
  investor.tokensAmount = [event.params.seedMoney.toBigDecimal()]

  // Handle tokensDecimals properly - fetch decimals and provide fallback
  let usdTokenDecimals = fetchTokenDecimals(stele.usdToken, event.block.timestamp)
  if (usdTokenDecimals !== null) {
    investor.tokensDecimals = [usdTokenDecimals]
  } else {
    log.error('[JOIN] Failed to get decimals for USD token, using default 18: {}', [stele.usdToken.toHexString()])
    investor.tokensDecimals = [BigInt.fromI32(18)] // default to 18 decimals
  }
  
  // Handle tokensSymbols properly - provide fallback
  let usdTokenSymbol = fetchTokenSymbol(stele.usdToken, event.block.timestamp)
  investor.tokensSymbols = [usdTokenSymbol || "USDC"]

  // At join time, profit should be zero
  investor.profitUSD = BigDecimal.fromString("0")
  investor.profitRatio = BigDecimal.fromString("0")
  investor.isClosed = false
  investor.save()

  investorSnapshot(event.params.challengeId, event.params.user, event)

  let activeChallenges = ActiveChallenges.load(Bytes.fromI32(0))
  if (activeChallenges == null) {
    log.debug('[JOIN] ActiveChallenges not found, ChallengeId : {}', [event.params.challengeId.toString()])
    return
  }
  switch (challenge.challengeType) {
    case ChallengeType.OneWeek:
      activeChallenges.one_week_investorCounter = activeChallenges.one_week_investorCounter.plus(BigInt.fromI32(1))
      activeChallenges.one_week_rewardAmountUSD = activeChallenges.one_week_rewardAmountUSD.plus(challenge.entryFee)
      break;
    case ChallengeType.OneMonth:
      activeChallenges.one_month_investorCounter = activeChallenges.one_month_investorCounter.plus(BigInt.fromI32(1))
      activeChallenges.one_month_rewardAmountUSD = activeChallenges.one_month_rewardAmountUSD.plus(challenge.entryFee)
      break;
    case ChallengeType.ThreeMonths:
      activeChallenges.three_month_investorCounter = activeChallenges.three_month_investorCounter.plus(BigInt.fromI32(1))
      activeChallenges.three_month_rewardAmountUSD = activeChallenges.three_month_rewardAmountUSD.plus(challenge.entryFee)
      break;
    case ChallengeType.SixMonths:
      activeChallenges.six_month_investorCounter = activeChallenges.six_month_investorCounter.plus(BigInt.fromI32(1))
      activeChallenges.six_month_rewardAmountUSD = activeChallenges.six_month_rewardAmountUSD.plus(challenge.entryFee)
      break;
    case ChallengeType.OneYear:
      activeChallenges.one_year_investorCounter = activeChallenges.one_year_investorCounter.plus(BigInt.fromI32(1))
      activeChallenges.one_year_rewardAmountUSD = activeChallenges.one_year_rewardAmountUSD.plus(challenge.entryFee)
      break;
    default:
      break;
  }  
  activeChallenges.save()
  activeChallengesSnapshot(event)
}

export function handleSwap(event: SwapEvent): void {
  let swap = new Swap(event.transaction.hash.concatI32(event.logIndex.toI32()))
  swap.challengeId = event.params.challengeId
  swap.user = event.params.user
  swap.fromAsset = event.params.fromAsset
  swap.toAsset = event.params.toAsset
  
  // Convert raw amounts to formatted amounts
  let fromTokenDecimals = fetchTokenDecimals(event.params.fromAsset, event.block.timestamp)
  let toTokenDecimals = fetchTokenDecimals(event.params.toAsset, event.block.timestamp)
  
  if (fromTokenDecimals !== null) {
    let fromAmount = BigDecimal.fromString(event.params.fromAmount.toString())
      .div(BigDecimal.fromString((10 ** fromTokenDecimals.toI32()).toString()))
    swap.fromAmount = fromAmount
  } else {
    log.warning('[SWAP] Failed to get decimals for fromAsset: {}', [event.params.fromAsset.toHexString()])
    swap.fromAmount = BigDecimal.fromString("0")
  }
  
  if (toTokenDecimals !== null) {
    let toAmount = BigDecimal.fromString(event.params.toAmount.toString())
      .div(BigDecimal.fromString((10 ** toTokenDecimals.toI32()).toString()))
    swap.toAmount = toAmount
  } else {
    log.warning('[SWAP] Failed to get decimals for toAsset: {}', [event.params.toAsset.toHexString()])
    swap.toAmount = BigDecimal.fromString("0")
  }
  
  // Debug: Log basic swap info
  log.info('[SWAP DEBUG] Starting swap processing: challengeId={}, user={}, fromAsset={}, toAsset={}, fromAmount={}, toAmount={}', [
    event.params.challengeId.toString(),
    event.params.user.toHexString(),
    event.params.fromAsset.toHexString(),
    event.params.toAsset.toHexString(),
    swap.fromAmount.toString(),
    swap.toAmount.toString()
  ])
  
  let ethPriceInUSD = getCachedEthPriceUSD(event.block.timestamp)
  
  // Debug: Log ETH price
  log.info('[SWAP DEBUG] ETH price in USD: {}', [ethPriceInUSD.toString()])

  // Add missing required price fields
  let fromTokenPriceETH = getCachedTokenPriceETH(Address.fromBytes(event.params.fromAsset), event.block.timestamp)
  let toTokenPriceETH = getCachedTokenPriceETH(Address.fromBytes(event.params.toAsset), event.block.timestamp)
  
  // Debug: Log token prices in ETH
  log.info('[SWAP DEBUG] fromToken ({}) price in ETH: {}', [
    event.params.fromAsset.toHexString(),
    fromTokenPriceETH ? fromTokenPriceETH.toString() : 'null'
  ])
  
  log.info('[SWAP DEBUG] toToken ({}) price in ETH: {}', [
    event.params.toAsset.toHexString(),
    toTokenPriceETH ? toTokenPriceETH.toString() : 'null'
  ])
  
  // Calculate and debug fromPriceUSD
  if (fromTokenPriceETH) {
    let fromPriceUSDDecimal = ethPriceInUSD.times(fromTokenPriceETH)
    log.info('[SWAP DEBUG] fromPriceUSD calculation: {} * {} = {}', [
      ethPriceInUSD.toString(),
      fromTokenPriceETH.toString(),
      fromPriceUSDDecimal.toString()
    ])
    swap.fromPriceUSD = fromPriceUSDDecimal.truncate(5)
    log.info('[SWAP DEBUG] Final fromPriceUSD: {}', [swap.fromPriceUSD.toString()])
  } else {
    log.warning('[SWAP DEBUG] fromTokenPriceETH is null, setting fromPriceUSD to 0', [])
    swap.fromPriceUSD = BigDecimal.fromString("0")
  }
  
  // Calculate and debug toPriceUSD
  if (toTokenPriceETH) {
    let toPriceUSDDecimal = ethPriceInUSD.times(toTokenPriceETH)
    log.info('[SWAP DEBUG] toPriceUSD calculation: {} * {} = {}', [
      ethPriceInUSD.toString(),
      toTokenPriceETH.toString(),
      toPriceUSDDecimal.toString()
    ])
    swap.toPriceUSD = toPriceUSDDecimal.truncate(5)
    log.info('[SWAP DEBUG] Final toPriceUSD: {}', [swap.toPriceUSD.toString()])
  } else {
    log.warning('[SWAP DEBUG] toTokenPriceETH is null, setting toPriceUSD to 0', [])
    swap.toPriceUSD = BigDecimal.fromString("0")
  }
  
  swap.blockNumber = event.block.number
  swap.blockTimestamp = event.block.timestamp
  swap.transactionHash = event.transaction.hash
  swap.save()
  
  log.info('[SWAP DEBUG] Swap saved successfully with fromPriceUSD={}, toPriceUSD={}', [
    swap.fromPriceUSD.toString(),
    swap.toPriceUSD.toString()
  ])

  // Update Investor and create investorSnapshot
  let investor = Investor.load(getInvestorID(event.params.challengeId, event.params.user))
  if (investor == null) {
    log.debug('[SWAP] Investor not found, Investor : {}', [getInvestorID(event.params.challengeId, event.params.user)])
    return
  }
  investor.updatedAtTimestamp = event.block.timestamp
  
  // get tokens data from getUserPortfolio function
  let steleContract = SteleContract.bind(Address.fromBytes(Address.fromHexString(STELE_ADDRESS)))
  let tokenAddresses: Bytes[] = []
  let tokensAmount: BigDecimal[] = []
  
  let portfolioResult = steleContract.try_getUserPortfolio(event.params.challengeId, event.params.user)
  if (portfolioResult.reverted) {
    log.warning('[SWAP] Failed to get user portfolio for user {} in challenge {}', [
      event.params.user.toHexString(),
      event.params.challengeId.toString()
    ])
    return
  }
  
  // Debug: Log raw portfolio data from getUserPortfolio
  log.info('[SWAP DEBUG] getUserPortfolio success for user {} in challenge {}', [
    event.params.user.toHexString(),
    event.params.challengeId.toString()
  ])
  
  log.info('[SWAP DEBUG] Raw portfolio data - {} tokens found', [
    portfolioResult.value.value0.length.toString()
  ])
  
  for (let i = 0; i < portfolioResult.value.value0.length; i++) {
    log.info('[SWAP DEBUG] Token {}: address={}, rawAmount={}', [
      i.toString(),
      portfolioResult.value.value0[i].toHexString(),
      portfolioResult.value.value1[i].toString()
    ])
  }
  
  tokenAddresses = portfolioResult.value.value0.map<Bytes>(addr => Bytes.fromHexString(addr.toHexString()))
  tokensAmount = portfolioResult.value.value1.map<BigDecimal>(amount => BigDecimal.fromString(amount.toString()))

  let tokensDeAmount: BigDecimal[] = []  // For calculation - decimal amounts
  let tokensDecimals: BigInt[] = []
  let tokensSymbols: string[] = []
  
  for (let i = 0; i < tokenAddresses.length; i++) {
    let token = tokenAddresses[i]
    let amount = tokensAmount[i]  // Raw amount from contract
    let deAmount = BigDecimal.fromString("0")
    
    const decimals = fetchTokenDecimals(token, event.block.timestamp)
    if (decimals === null) {
      log.debug('[SWAP] Failed to get decimals for token: {}', [token.toHexString()])
      tokensDeAmount.push(BigDecimal.fromString("0"))
      tokensDecimals.push(BigInt.fromI32(18)) // default to 18
      tokensSymbols.push("UNKNOWN")
      continue
    }
    
    const tokenDecimal = exponentToBigDecimal(decimals)
    deAmount = amount.div(tokenDecimal)
    tokensDeAmount.push(deAmount)
    tokensDecimals.push(decimals)
    
    const symbol = fetchTokenSymbol(token, event.block.timestamp)
    tokensSymbols.push(symbol || "UNKNOWN")
  }

  // get total tokens price in USD with sum of tokens
  let totalPriceUSD = BigDecimal.fromString("0")
  for (let i = 0; i < tokenAddresses.length; i++) {
    let token = tokenAddresses[i]
    let deAmount = tokensDeAmount[i]  // Use decimal amount for price calculation
    let tokenPriceETH = getTokenPriceETH(Address.fromBytes(token), event.block.timestamp)
    if (tokenPriceETH === null) {
      log.debug('[SWAP] User {} in challenge {} Failed to get price ETH for token: {}', 
        [event.params.user.toHexString(), event.params.challengeId.toString(), token.toHexString()])
      continue
    }
    const amountETH = deAmount.times(tokenPriceETH)
    const amountUSD = amountETH.times(ethPriceInUSD)
    totalPriceUSD = totalPriceUSD.plus(amountUSD)
  }
  
  // Debug: Log the token amounts being stored
  log.info('[SWAP DEBUG] User {} in challenge {} - Portfolio update:', [
    event.params.user.toHexString(), 
    event.params.challengeId.toString()
  ])
  
  for (let i = 0; i < tokenAddresses.length; i++) {
    log.info('[SWAP DEBUG] Token {}: rawAmount={}, decimalAmount={}, symbol={}', [
      tokenAddresses[i].toHexString(),
      tokensAmount[i].toString(),
      tokensDeAmount[i].toString(),
      tokensSymbols[i]
    ])
  }
  
  log.info('[SWAP DEBUG] Previous currentUSD: {}, New currentUSD: {}', [
    investor.currentUSD.toString(),
    totalPriceUSD.truncate(5).toString()
  ])
  
  investor.tokens = tokenAddresses
  investor.tokensAmount = tokensDeAmount
  investor.tokensDecimals = tokensDecimals
  investor.tokensSymbols = tokensSymbols
  investor.currentUSD = totalPriceUSD.truncate(5)
  investor.profitUSD = investor.currentUSD.minus(investor.seedMoneyUSD).truncate(5)
  investor.profitRatio = investor.profitUSD.div(investor.seedMoneyUSD).truncate(5)
  investor.save()

  investorSnapshot(event.params.challengeId, event.params.user, event)
}

export function handleRegister(event: RegisterEvent): void {
  let register = new Register(event.transaction.hash.concatI32(event.logIndex.toI32()))
  register.challengeId = event.params.challengeId
  register.user = event.params.user
  register.performance = event.params.performance
  register.blockNumber = event.block.number
  register.blockTimestamp = event.block.timestamp
  register.transactionHash = event.transaction.hash
  register.save()

  let investor = Investor.load(getInvestorID(event.params.challengeId, event.params.user))
  if (investor == null) {
    log.debug('[REGISTER] Investor not found, Investor : {}', [getInvestorID(event.params.challengeId, event.params.user)])
    return
  }
  investor.isClosed = true
  investor.save()

  // Debug: Log the performance value from Register event
  log.info('[REGISTER DEBUG] Register event - User: {}, Performance: {}', [
    event.params.user.toHexString(),
    event.params.performance.toString()
  ])

  // Update ranking by calling getRanking from Stele contract
  let steleContract = SteleContract.bind(Address.fromBytes(Address.fromHexString(STELE_ADDRESS)))
  let rankingResult = steleContract.try_getRanking(event.params.challengeId)
  
  if (!rankingResult.reverted) {
    let ranking = Ranking.load(event.params.challengeId.toString())
    if (ranking == null) {
      ranking = new Ranking(event.params.challengeId.toString())
      ranking.challengeId = event.params.challengeId.toString()
    }
    
    // Get USD token decimals for formatting scores
    let steleEntity = Stele.load(Bytes.fromI32(0))
    if (steleEntity == null) {
      log.debug('[REGISTER] Stele entity not found, ChallengeId : {}', [event.params.challengeId.toString()])
      return
    }
    
    let usdTokenDecimals = fetchTokenDecimals(steleEntity.usdToken, event.block.timestamp)
    if (usdTokenDecimals === null) {
      log.error('[REGISTER] Failed to get USD token decimals, ChallengeId : {}', [event.params.challengeId.toString()])
      return
    }
    
    let decimalDivisor = exponentToBigDecimal(usdTokenDecimals)
    
    // Convert addresses and scores to Bytes[] and BigDecimal[]
    let topUsers: Bytes[] = []
    let scores: BigDecimal[] = []
    
    // Debug: Log the raw values returned from getRanking
    log.info('[REGISTER DEBUG] getRanking returned {} users', [
      rankingResult.value.value0.length.toString()
    ])
    
    for (let i = 0; i < rankingResult.value.value0.length; i++) {
      topUsers.push(Bytes.fromHexString(rankingResult.value.value0[i].toHexString()))
      
      // Convert raw score to formatted value using USD token decimals
      let formattedScore = BigDecimal.fromString(rankingResult.value.value1[i].toString()).div(decimalDivisor)
      
      // Debug: Log individual score values (raw vs formatted)
      log.info('[REGISTER DEBUG] User {} - Raw score: {}, Formatted score: {}', [
        rankingResult.value.value0[i].toHexString(),
        rankingResult.value.value1[i].toString(),
        formattedScore.toString()
      ])
      
      scores.push(formattedScore)
    }

    let challenge = Challenge.load(event.params.challengeId.toString())
    if (challenge == null) {
      log.debug('[REGISTER] Challenge not found, ChallengeId : {}', [event.params.challengeId.toString()])
      return
    }
    
    // challenge.seedMoney is already formatted (divided by decimals in handleCreate)
    let seedMoneyFormatted = BigDecimal.fromString(challenge.seedMoney.toString())
    
    ranking.seedMoney = challenge.seedMoney
    ranking.topUsers = topUsers
    ranking.scores = scores
    
    // Calculate profit ratios using formatted scores and seedMoney
    let profitRatios: BigDecimal[] = []
    for (let i = 0; i < scores.length; i++) {
      if (!seedMoneyFormatted.equals(BigDecimal.fromString("0"))) {
        // Calculate profit ratio: (formattedScore - seedMoneyFormatted) / seedMoneyFormatted * 100
        let profitDecimal = scores[i].minus(seedMoneyFormatted)
        let profitRatio = profitDecimal.div(seedMoneyFormatted).times(BigDecimal.fromString("100")).truncate(4)
        profitRatios.push(profitRatio)
        
        // Debug: Log profit ratio calculation
        log.info('[REGISTER DEBUG] User {} - Score: {}, SeedMoney: {}, ProfitRatio: {}%', [
          topUsers[i].toHexString(),
          scores[i].toString(),
          seedMoneyFormatted.toString(),
          profitRatio.toString()
        ])
      } else {
        profitRatios.push(BigDecimal.fromString("0"))
      }
    }
    ranking.profitRatios = profitRatios
    
    ranking.updatedAtTimestamp = event.block.timestamp
    ranking.updatedAtBlockNumber = event.block.number
    ranking.updatedAtTransactionHash = event.transaction.hash
    ranking.save()

    let totalRanking = TotalRanking.load(getInvestorID(event.params.challengeId, event.params.user))
    if (totalRanking == null) {
      totalRanking = new TotalRanking(getInvestorID(event.params.challengeId, event.params.user))
    }
    totalRanking.challengeId = event.params.challengeId.toString()
    totalRanking.seedMoney = challenge.seedMoney
    totalRanking.user = event.params.user
    let formattedScore = BigDecimal.fromString(event.params.performance.toString()).div(decimalDivisor)
    totalRanking.score = formattedScore
    let profitDecimal = formattedScore.minus(seedMoneyFormatted)
    let profitRatio = profitDecimal.div(seedMoneyFormatted).times(BigDecimal.fromString("100")).truncate(4)
    totalRanking.profitRatio = profitRatio
    totalRanking.updatedAtTimestamp = event.block.timestamp
    totalRanking.save()
    
    log.info('[REGISTER] Updated ranking for challenge {} with {} users', [
      event.params.challengeId.toString(),
      topUsers.length.toString()
    ])
  } else {
    log.warning('[REGISTER] Failed to get ranking for challenge {}', [
      event.params.challengeId.toString()
    ])
  }
}

export function handleReward(event: RewardEvent): void {
  let reward = new Reward(event.transaction.hash.concatI32(event.logIndex.toI32()))
  reward.challengeId = event.params.challengeId
  reward.user = event.params.user
  reward.rewardAmount = event.params.rewardAmount
  reward.blockNumber = event.block.number
  reward.blockTimestamp = event.block.timestamp
  reward.transactionHash = event.transaction.hash
  reward.save()

  let activeChallenges = ActiveChallenges.load(Bytes.fromI32(0))
  if (activeChallenges == null) {
    log.debug('[REWARD] ActiveChallenges not found, ChallengeId : {}', [event.params.challengeId.toString()])
    return
  }
  let challenge = Challenge.load(event.params.challengeId.toString())
  if (challenge == null) {
    log.debug('[REWARD] Challenge not found, ChallengeId : {}', [event.params.challengeId.toString()])
    return
  }
  switch (challenge.challengeType) {
    case ChallengeType.OneWeek:
      activeChallenges.one_week_isCompleted = true
      break;
    case ChallengeType.OneMonth:
      activeChallenges.one_month_isCompleted = true
      break;
    case ChallengeType.ThreeMonths:
      activeChallenges.three_month_isCompleted = true
      break;
    case ChallengeType.SixMonths:
      activeChallenges.six_month_isCompleted = true
      break;
    case ChallengeType.OneYear:
      activeChallenges.one_year_isCompleted = true
      break;
    default:
      break;
  }
  challenge.isActive = false
  challenge.save()
  activeChallenges.save()
}

export function handleSteleTokenBonus(event: SteleTokenBonusEvent): void {
  let steleTokenBonus = new SteleTokenBonus(event.transaction.hash.concatI32(event.logIndex.toI32()))
  steleTokenBonus.challengeId = event.params.challengeId
  steleTokenBonus.user = event.params.user
  steleTokenBonus.action = event.params.action
  steleTokenBonus.amount = event.params.amount
  steleTokenBonus.blockNumber = event.block.number
  steleTokenBonus.blockTimestamp = event.block.timestamp
  steleTokenBonus.transactionHash = event.transaction.hash
}