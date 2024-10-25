import { Link, ssr } from "arnext"
import { useEffect, useState } from "react"
import { message, createDataItemSigner, result } from "@permaweb/aoconnect"
import { ChakraProvider, useToast, Input, Flex, Button } from "@chakra-ui/react"

const AO_PROCESS_ID = "DAW6amChwu37lhrftAVKlDEzTsCRbwWHy8JDjTzjAik"

export default function Home({ _date = null }) {
  const [name, setName] = useState("")
  const [submittedBy, setSubmittedBy] = useState("")
  const [submissionLink, setSubmissionLink] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [info, setInfo] = useState({})

  const toast = useToast()

  const submit = async () => {
    const messageId = await message({
      process: AO_PROCESS_ID,
      tags: [
        {
          name: "Action",
          value: "Submit",
        },
        {
          name: "Name",
          value: name,
        },
        {
          name: "SubmittedBy",
          value: submittedBy,
        },
        {
          name: "Link",
          value: submissionLink,
        },
        {
          name: "WalletAddress",
          value: walletAddress,
        },
        {
          name: "Info",
          value: JSON.stringify(info),
        },
      ],
      signer: createDataItemSigner(globalThis.arweaveWallet),
    })
    console.log("messageId", messageId)

    const _result = await result({
      message: messageId,
      process: AO_PROCESS_ID,
    })
    console.log("_result", _result)
    console.log(_result?.Messages?.[0]?.Data)

    const errorTag = _result?.Messages?.[0]?.Tags.find(
      (tag) => tag.name === "Error"
    )
    console.log("errorTag", errorTag)
    if (errorTag) {
      toast({
        description: _result?.Messages?.[0]?.Data,
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
      return
    }

    toast({
      description: _result?.Messages?.[0]?.Data,
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "top",
    })
  }

  return (
    <>
      <ChakraProvider>
        <Flex flexDirection="column" gap="10px" paddingY={8}>
          <Input
            type="text"
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Submitted By"
            onChange={(e) => setSubmittedBy(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Submission Link"
            onChange={(e) => setSubmissionLink(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Wallet Address"
            onChange={(e) => setWalletAddress(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Additional Info (in JSON format) e.g. { 'key': 'value' }"
            onChange={(e) => {
              try {
                setInfo(JSON.parse(e.target.value))
              } catch {
                console.error("Invalid JSON format for Additional Info")
              }
            }}
          />

          <Button onClick={submit}>Submit</Button>
        </Flex>
      </ChakraProvider>
    </>
  )
}
