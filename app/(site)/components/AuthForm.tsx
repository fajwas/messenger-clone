"use client"

import axios from "axios";

import Input from "@/app/components/inputs/input";
import { useCallback, useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

import { BsGithub, BsGoogle } from "react-icons/bs";

import Button from "@/app/components/Button";
import AuthSocialButton from "./AuthSocialButton";
import toast from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";



type variant ='LOGIN' | 'REGISTER';

const AuthForm = () => {
    const session = useSession();
    const router= useRouter();
    const [variant,setVariant] = useState<variant>('LOGIN');
    const [isLoading,setIsLoading] = useState(false);

    useEffect(()=>{
        if (session?.status == 'authenticated'){
            router.push('/users');
        }
    },[session?.status,router]);

    const toggleVariant=useCallback(()=>{
        if (variant === 'LOGIN'){
            setVariant('REGISTER');
        }else{
            setVariant('LOGIN');
        }

    }, [variant]);

    const{
        register,
        handleSubmit,
        formState:{
            errors
        }

    }=useForm<FieldValues>({
        defaultValues:{
            name:'',
            email:'',
            password:'',

        }
    });

    const onSubmit:SubmitHandler<FieldValues>=(data)=>{
        setIsLoading(true);

        if(variant=='REGISTER'){
            axios.post('/api/register',data)
            .then(()=> signIn('credentials',data))
            .catch(()=> toast.error('something went wrong'))
            .finally(()=> setIsLoading(false))

        }
        if(variant=='LOGIN'){
            signIn('credentials',{
                ...data,
                redirect:false
            })
            .then((callback)=>{
                if(callback?.error){
                    toast.error("invalid credentials");
                }

                if(callback?.ok && !callback?.error){
                    toast.success('logged in');
                    router.push('/users');
                }
            })
            .finally(()=> setIsLoading(false));
        }
    }

    const socialAction=(action:string)=>{
        setIsLoading(true);

        signIn(action,{ redirect:false })
        .then((callback)=>{
            if(callback?.error){
                toast.error('invalid credentials');
            }
            if(!callback?.error && callback?.ok){
                toast.success('loggedin')
            }
        })
        .finally(()=>setIsLoading(false));
    }

    return ( 
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {variant == 'REGISTER'&& (
                    <Input id='name' label="name" register={register} errors={errors} disabled={isLoading} />
                    )}
                    <Input id='email' label="email address" type="email" register={register} errors={errors} disabled={isLoading}/>
                    <Input id='password' label="password" type="password" register={register} errors={errors} disabled={isLoading}/>
                    <Button disabled={isLoading} fullwidth type="submit">
                        {variant =='LOGIN' ? 'Sign in': 'Register'}
                    </Button>
                </form>
                <div className="mt-6">
                    <div className="relative">
                        <div
                        className="
                        absolute
                        inset-0
                        flex
                        items-center
                        "
                        >
                            <div className="w-full border-t broder-gray-300" />

                        </div>
                            <div className="relative flex justify-center text:sm">
                            <span className="bg-white px-2 text-gray-500">
                            or continue with
                            </span>
                            </div>
                    </div>
                    <div className="mt-6 flex gap-2">
                        <AuthSocialButton
                        icon={BsGithub}
                        onClick={()=>socialAction('github')} />
                        <AuthSocialButton
                        icon={BsGoogle}
                        onClick={()=>socialAction('google')} />
                    </div>
                </div>
                <div className="flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500">
                        <div>
                            {variant === 'LOGIN' ? 'new to messenger?':'already have an account?'}
                        </div>
                        <div 
                        onClick={toggleVariant}
                        className="underline cursor-pointer">
                            {variant === 'LOGIN' ? 'create an account' : 'login'}
                        </div>
                </div>
            </div>
        </div>
     );
}
 
export default AuthForm;