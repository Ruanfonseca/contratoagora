import { containerCurrentForm as containerForm } from "@/app/contratos/constantes/framer-motion";
import type { UseMsOptions } from "@/app/contratos/types/mscompraevenda";
import { motion } from 'framer-motion';
import { type Context, useCallback, useContext } from "react";
import { SubmitErrorHandler, SubmitHandler } from "react-hook-form";
import { z } from "zod";


//bione-ignore lint:must be any as it is any object
function useMsForm<T extends UseMsOptions<any>>( 
    context:Context<T>,

){
    const {forms,schema,currentStep,setCurrentStep,form,saveFormData}= useContext(context)
    
    if (form === undefined) {
       throw new Error("a react-hook-form must be defined");
    }
    
    const steps = forms.length;
    
    const nextStep = () =>{
        if (currentStep < steps-1) {
            setCurrentStep((step)=>step + 1);
        }
        
    }

    const previousStep = () =>{
        if (currentStep > 0 ) {
            setCurrentStep((step)=>step - 1);
        }
    }

    const goToStep = (index:number)=>{
        if(index >=0 && index < steps){
            setCurrentStep((step) => index)
        }
    }

    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps - 1;
    const currentStepLabel = forms[currentStep].label;
    
    const onSubmit:SubmitHandler<z.infer<typeof schema>> = async(values)=>{
        
        if (isLastStep) {
            await saveFormData(values);
        }
        
        nextStep();
    }

    /**
     * 
     * @param errors 
     * toda vez que o usuario clicar em próximo e der erro , 
     * ele vai ser tratado aqui
     * 
     */
    const onErrors:SubmitErrorHandler<z.infer<typeof schema>> =
     (errors)=>{
         const stepFields = forms[currentStep].fields.flat();
         const errorFields = new Set(Object.keys(errors).flat());
         let hasStepErrors = false;

         for(const field of stepFields){
            if (errorFields.has(field as string)) {
                hasStepErrors = true;
                return; 
            }
         }
         if (!hasStepErrors) {
            //limpa o set de erros e vai para o próximo  
            form?.clearErrors();
             nextStep();
         }
    }
    const labels = forms.map((form)=>form.label);
    
    const CurrentForm: React.FC = useCallback(() => {
		const Step = forms[currentStep].form;
		return (
			<motion.div variants={containerForm} className="flex flex-col gap-2" initial="hidden" animate="visible" exit="exit">
				<Step />
			</motion.div>
		);
	}, [forms, currentStep]);

    return{
        form,
		currentStep,
		steps,
		nextStep,
		previousStep,
		goToStep,
		isFirstStep,
		isLastStep,
		labels,
		currentStepLabel,
		CurrentForm,
		onSubmit,
		onErrors,
    }
}

export { useMsForm };
