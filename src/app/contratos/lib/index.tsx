/* eslint-disable react-hooks/rules-of-hooks */
import { zodResolver } from "@hookform/resolvers/zod";
import { createContext, useState } from "react";
import { type DefaultValues, type FieldValues, useForm } from "react-hook-form";
import type { ZodSchema } from "zod";
import { UseMsOptions } from "../types/mscompraevenda";


export default function BuildMultiStepForm<T extends FieldValues, U extends UseMsOptions<T>>(
	initialFormOptions: U,
	schema: ZodSchema<T>,
	initialFormData: DefaultValues<T>,
) {
	const FormContext = createContext<UseMsOptions<T>>(initialFormOptions);
	
    const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
		const [currentStep, setCurrentStep] = useState(initialFormOptions.currentStep);
		const form = useForm<T>({
			resolver: zodResolver(schema),
			defaultValues: initialFormData,
		});

		return (
			<FormContext.Provider value={{ ...initialFormOptions, setCurrentStep, currentStep, form }}>
				{children}
			</FormContext.Provider>
		);
	};
	return {
		FormContext,
		FormProvider,
	};
}