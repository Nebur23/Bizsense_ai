"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SubmitButton } from "@/components/common/SubmitButton";
import CreateBusiness from "@/actions/business/create";

import { GROUPED_BUSINESS_TYPES } from "@/data/business-type";
import { suggestBusinessType } from "@/lib/autoBusinessType";
import { authClient } from "@/lib/auth-client";
import LocationSelector from "@/components/ui/location-input";
import { PhoneInput } from "@/components/ui/phone-input";

const formSchema = z.object({
  name: z.string().min(1, { message: "Business name is required." }),
  type: z.string().min(1, { message: "Business type is required." }),
  phone: z.string(),
  email: z.string().optional(),
  website: z.string().min(1).optional(),
  location: z.tuple([z.string().min(1), z.string().optional()]),
  city: z.string(),
});

interface StateProps {
  id: number;
  name: string;
  country_id: number;
  country_code: string;
  country_name: string;
  state_code: string;
  type: string | null;
  latitude: string;
  longitude: string;
}

interface Timezone {
  zoneName: string;
  gmtOffset: number;
  gmtOffsetName: string;
  abbreviation: string;
  tzName: string;
}

interface CountryProps {
  id: number;
  name: string;
  iso3: string;
  iso2: string;
  numeric_code: string;
  phone_code: string;
  capital: string;
  currency: string;
  currency_name: string;
  currency_symbol: string;
  tld: string;
  native: string;
  region: string;
  region_id: string;
  subregion: string;
  subregion_id: string;
  nationality: string;
  timezones: Timezone[];
  translations: Record<string, string>;
  latitude: string;
  longitude: string;
  emoji: string;
  emojiU: string;
}

export default function MyForm() {
  const router = useRouter();
  const [countryName, setCountryName] = useState<string>("Cameroon");
  const [stateName, setStateName] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      location: ["Cameroon", ""],
      email: "",
    },
  });

  const handleCountryChange = useCallback(
    (country: CountryProps | null) => {
      setCountryName(country?.name || "");
      form.setValue("location", [country?.name || "", stateName || ""]);
    },
    [form, stateName]
  );

  const handleStateChange = useCallback(
    (state: StateProps | null) => {
      setStateName(state?.name || "");
      form.setValue("location", [countryName || "Cameroon", state?.name || ""]);
    },
    [form, countryName]
  );

  const businessName = form.watch("name");

  // Auto-assign type if none has been selected
  useEffect(() => {
    if (!businessName) {
      form.setValue("type", "");
    }

    const suggested = suggestBusinessType(businessName);
    const currentType = form.getValues("type");

    if (suggested && !currentType) {
      form.setValue("type", suggested);
    }
  }, [businessName, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // toast(
    //   <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
    //     <code className='text-white'>{JSON.stringify(values, null, 2)}</code>
    //   </pre>
    // );
    try {
      const { data: session } = await authClient.getSession();
      const user = session?.user;

      if (!user) router.replace("/signin");

      await authClient.organization.create(
        {
          name: values.name,
          slug: `${values.name
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")}${Math.floor(Math.random() * 1000)}`,
          //type: values.type,
        },
        {
          onResponse: () => {
            // setLoading(false);
          },
          onSuccess: async res => {
            const payload = {
              id: res.data.id,
              type: values.type,
              name: values.name,
              location: values.location,
              city: values.city,
              phone: values.phone,
              email: values.email,
              website: values.website ?? null,
            };

            const biz = await CreateBusiness(payload);
            if (biz.statusCode === 201 && biz.businessId) {
              router.replace(`/dashboard/${biz.businessId}`);
              toast.success(biz.message);
            } else {
              toast.error(biz.message || "Something went wrong");
            }
            //toast.success("Organization created successfully");
          },
          onError: error => {
            toast.error(error.error.message);
            // setLoading(false);
          },
        }
      );
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8 w-full py-10 px-4 sm:px-0 lg:px-0'
      >
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input placeholder='e.g., my shop' {...field} />
              </FormControl>
              <FormDescription>
                This is the name customers will see.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='type'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select business type' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='max-h-[400px] overflow-y-auto'>
                  {GROUPED_BUSINESS_TYPES.map(group => (
                    <SelectGroup key={group.group}>
                      <SelectLabel>{group.group}</SelectLabel>
                      {group.options.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className='flex items-start gap-3 text-left'>
                            <option.icon className='w-4 h-4 mt-1 text-muted-foreground' />
                            <div>
                              <p className='font-medium'>{option.label}</p>
                              <p className='text-xs text-muted-foreground'>
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the category that best describes your business.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem className='flex flex-col items-start'>
              <FormLabel>Phone number</FormLabel>
              <FormControl className='w-full'>
                <PhoneInput
                  placeholder='6 56 43 55 98'
                  {...field}
                  defaultCountry='CM'
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder='your_business@email.com'
                  type='email'
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='website'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input
                  placeholder='https://your_business.com'
                  type='text'
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='location'
          render={() => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <LocationSelector
                  onCountryChange={handleCountryChange}
                  onStateChange={handleStateChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='city'
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='yaounde'>Yaoundé</SelectItem>
                  <SelectItem value='douala'>Douala</SelectItem>
                  <SelectItem value='garoua'>Garoua</SelectItem>
                  <SelectItem value='bamenda'>Bamenda</SelectItem>
                  <SelectItem value='maroua'>Maroua</SelectItem>
                  <SelectItem value='nkongsamba'>Nkongsamba</SelectItem>
                  <SelectItem value='bafoussam'>Bafoussam</SelectItem>
                  <SelectItem value='ngaoundere'>Ngaoundéré</SelectItem>
                  <SelectItem value='bertoua'>Bertoua</SelectItem>
                  <SelectItem value='loum'>Loum</SelectItem>
                  <SelectItem value='kumba'>Kumba</SelectItem>
                  <SelectItem value='edea'>Edéa</SelectItem>
                  <SelectItem value='kumbo'>Kumbo</SelectItem>
                  <SelectItem value='foumban'>Foumban</SelectItem>
                  <SelectItem value='mbouda'>Mbouda</SelectItem>
                  <SelectItem value='dschang'>Dschang</SelectItem>
                  <SelectItem value='limbe'>Limbé</SelectItem>
                  <SelectItem value='ebolowa'>Ebolowa</SelectItem>
                  <SelectItem value='kousseri'>Kousséri</SelectItem>
                  <SelectItem value='kribi'>Kribi</SelectItem>
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />

        <SubmitButton
          form={form}
          loadingText='Submitting...'
          defaultText='Submit'
          variant='default'
          className='w-full'
        />
      </form>
    </Form>
  );
}
