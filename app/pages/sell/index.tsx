import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Checkbox, Label, Selector, Steps, Textarea } from "components"
import { Amount, Setup } from "components/Listing"
import { UIList } from "components/Listing/Listing.types"
import PaymentMethod from "components/Listing/PaymentMethod"
import Summary from "components/Listing/Summary"
import { useState } from "react"
import { useAccount, useNetwork } from "wagmi"

const SETUP_STEP = 1
const AMOUNT_STEP = 2
const PAYMENT_METHOD_STEP = 3
const DETAILS_STEP = 4
const DONE_STEP = 5

const SellPage = () => {
  const { address } = useAccount()
  const { chain } = useNetwork()
  const [list, setList] = useState<UIList>({ step: SETUP_STEP } as UIList)
  const step = list.step

  if (!address || !chain || chain.unsupported) {
    return (
      <div className="flex h-screen">
        <div className="m-auto flex flex-col justify-items-center content-center text-center">
          <span className="mb-6 text-xl">Connect to Polygon</span>{" "}
          <span className="mb-6 text-gray-500 text-xl">
            Access the OpenPeer using your favorite wallet
          </span>
          <span className="mb-4 m-auto">
            <ConnectButton showBalance={false} />
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 mb-16">
        <h1 className="text-2xl font-semibold text-gray-900">
          Crypto Listing » Sell Order
        </h1>
      </div>
      <div className="w-full flex flex-row px-4 sm:px-6 md:px-8 mb-16">
        <div className="w-full lg:w-2/4">
          <Steps
            currentStep={step}
            onStepClick={(n) => setList({ ...list, ...{ step: n } })}
          />
          {step === SETUP_STEP && <Setup list={list} updateList={setList} />}
          {step === AMOUNT_STEP && <Amount list={list} updateList={setList} />}
          {step === PAYMENT_METHOD_STEP && (
            <PaymentMethod list={list} updateList={setList} />
          )}
          {step === DETAILS_STEP && (
            <div className="my-8">
              <Label title="Time Limit for Payment" />
              <Selector
                value={10}
                suffix=" mins"
                updateValue={() => console.log("update")}
              />
              <Textarea
                label="Order Terms"
                rows={4}
                name="OrderTerms"
                placeholder="Write the terms and conditions for your listing here"
              />
              <Label title="Order Approval" />
              <div className="flex flex-col content-center rounded-lg bg-white p-4 border-2">
                <Checkbox content="Manual" id="manual" name="OrderApproval" />
                <Checkbox content="Automatic" id="automatic" name="OrderApproval" />
              </div>
            </div>
          )}
          {step === DONE_STEP && (
            <div className="flex h-screen">
              <div className="m-auto flex flex-col justify-items-center content-center text-center">
                <span className="mb-6 text-xl">Crypto Listing completed.</span>
              </div>
            </div>
          )}
        </div>
        <Summary />
      </div>
    </div>
  )
}

export default SellPage
