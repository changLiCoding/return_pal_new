import React from 'react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import Router from 'next/router'
import { useToast } from '@/components/ui/use-toast'
import {
  ReturnProcessBackButton,
  ReturnProcessNextButton,
} from '@/components/ui/common'
import { useReturnProcess } from '@/hooks/useReturnProcess'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import Head from 'next/head'

const formSchema = z.object({
  address: z.string().min(1),
})

export default function Address() {
  const returnProcess = useReturnProcess()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: returnProcess.currentData.address,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Submitted:', values)
    returnProcess.setCurrentData(values)
    returnProcess.forward()
  }
  const [addresses, setAddresses] = useState<
    { name: string; address: string; default: boolean }[]
  >([])
  const [addAddress, setAddAddress] = useState(false)
  const { toast } = useToast()

  const mockAddresses: { name: string; address: string; default: boolean }[] = [
    {
      name: 'Bob Gunderson',
      address: '6500 Boulevard de Rome, Brossard, QC, J4Y 0B6, Canada',
      default: true,
    },
    {
      name: 'Marky Mark',
      address: '123 King St',
      default: false,
    },
  ]
  const addressSchema = z.object({
    name: z.string().min(2),
    address: z.string().min(3).max(50),
    city: z.string().min(3).max(50),
    province: z.string().min(2).max(2),
    postal: z.string().min(6),
  })
  const validateFormData = (inputs: unknown) => {
    const isValidData = addressSchema.parse(inputs)
    return isValidData
  }
  const addressValidator = (addressObj: {
    name: string
    address: string
    city: string
    province: string
    postal: string
  }) => {
    try {
      const valid = validateFormData(addressObj)
      if (!valid) {
        return
      }
      console.log(valid)
      console.log('adding new address to profile!')
      const newAddress: { name: string; address: string; default: boolean } = {
        name: addressObj.name,
        address: `${addressObj.address}, ${addressObj.city}, ${addressObj.province}, ${addressObj.postal}`,
        default: false,
      }
      setAddresses([...addresses, newAddress])
    } catch (err) {
      console.log(err)
      toast({
        variant: 'destructive',
        description:
          'Please ensure that all fields are filled in, province field contains only two letters, and postal code is correct',
      })
    }
  }
  useEffect(() => {
    setAddresses(mockAddresses)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const addNewAddress = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const target = event.target as HTMLFormElement
    const addressToAdd = {
      name: (target[0] as HTMLInputElement).value,
      address: (target[1] as HTMLInputElement).value,
      city: (target[2] as HTMLInputElement).value,
      province: (target[3] as HTMLInputElement).value,
      postal: (target[4] as HTMLInputElement).value,
    }
    addressValidator(addressToAdd)
  }
  const toggleAddressForm = () => {
    setAddAddress(!addAddress)
  }
  const handleAddressSelection = () => {
    const form = document.getElementById('selectAddressForm')
    if (form) {
      const radioInputs = form.querySelectorAll('input[type="radio"]')
      let selectedValue: string | undefined

      radioInputs.forEach((element: Element) => {
        if (element instanceof HTMLInputElement) {
          const input = element
          if (input.checked) {
            selectedValue = input.value
          }
        }
      })
      console.log(selectedValue)

      if (selectedValue) {
        void Router.push('/pickup')
      } else {
        toast({
          variant: 'destructive',
          description: 'Please select an address before proceeding.',
        })
      }
    }
  }
  const addressArrayMapper = (
    addressArray: { name: string; address: string; default: boolean }[]
  ) => {
    return addressArray.map((address) => {
      return (
        <div
          key={addressArray.indexOf(address)}
          className="fontSize-large my-7 flex h-10 w-full items-center "
        >
          <Input
            type="radio"
            id={address.address}
            value={address.address}
            name="address"
            className="mx-2 h-6 w-8 w-[10%]"
          />{' '}
          <Label
            htmlFor={address.address}
            className="break-word mx-2  w-[20%] font-bold sm:w-[10%] "
          >
            {address.name}{' '}
          </Label>{' '}
          <Label
            htmlFor={address.address}
            className="break-word my-2 w-[35%] max-w-max py-2 sm:w-[50%] "
          >
            {' '}
            {address.address}{' '}
          </Label>{' '}
          <Label
            htmlFor={address.address}
            className="mx-2 w-[10%] font-bold text-primary"
          >
            {address.default && 'Default address'}
          </Label>
        </div>
      )
    })
  }

  return (
    <>
      <Head>
        <title>Return Process - Pick Address</title>
      </Head>
      <Form {...form}>
        <form
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="mx-5 my-5">
            <div className="text-largeText text-brand">Pickup Details</div>
            <div>
              <div className="text-brand">
                Select or add your pickup address
              </div>
              <div className="mt-5 text-smallText font-bold text-brand">
                Your Addresses:
              </div>
              <Separator className="h-[0.15rem] w-3/4 rounded-full bg-brand" />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        {mockAddresses.map((address) => {
                          return (
                            <FormItem
                              key={address.address}
                              className="flex items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <RadioGroupItem value={address.address} />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {address.address}
                              </FormLabel>
                            </FormItem>
                          )
                        })}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                    <Button type="submit">Submit</Button>
                  </FormItem>
                )}
              />

              <Button
                className="bg-transparent font-bold text-primary hover:bg-transparent"
                onClick={toggleAddressForm}
              >
                + Add a new address{' '}
              </Button>
              {addAddress && (
                <form
                  className="flex-column flex w-3/4 justify-around"
                  onSubmit={(e) => addNewAddress(e)}
                >
                  <div className="flex-column flex">
                    <div className="flex flex-row items-center ">
                      <div className="mr-5 items-center">
                        <div className="my-2 flex items-center">
                          <Label className="w-1/3">Name:</Label>
                          <Input
                            type="text"
                            name="name"
                            className="my-2  w-3/4"
                          />
                        </div>
                        <div className="my-2 flex items-center">
                          <Label className="w-1/3">Address: </Label>
                          <Input
                            type="text"
                            name="address"
                            className="my-2  w-3/4"
                          />
                        </div>
                        <div className="my-2 flex items-center">
                          <Label className="w-1/3">City: </Label>
                          <Input
                            type="text"
                            name="address"
                            className="my-2 w-3/4"
                          />
                        </div>
                        <div className="my-2 flex items-center">
                          <Label className="w-1/3">Province: (e.g. ON) </Label>
                          <Input
                            type="text"
                            name="address"
                            className="my-2  w-3/4"
                          />
                        </div>
                        <div className="my-2 flex items-center">
                          <Label className="w-1/3">Postal Code </Label>
                          <Input
                            type="text"
                            name="address"
                            className="my-2  w-3/4"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-around">
                    <button className="h-1/4 text-primary" type="submit">
                      Add new address
                    </button>
                  </div>
                </form>
              )}
              <span className="mt-5 flex justify-between">
                <ReturnProcessBackButton onClick={() => returnProcess.back()} />

                <ReturnProcessNextButton formState={form.formState} />
              </span>
            </div>
          </div>
        </form>
      </Form>
    </>
  )
}