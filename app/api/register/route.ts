import bcrypt from "bcrypt";

import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(
    request:Request
){
    try{
    const body = await request.json()
    const {name,email,password}=body;

    if(!email || !name ||!password){
        return new NextResponse('missing info',{status:400});
    }

    const hashedPassword=await bcrypt.hash(password,12);

    const user=await prisma.user.create({
        data:{
            email,
            name,
            hashedPassword
        }
    });
    return NextResponse.json(user);
    }catch(error:any){
        console.log(error,'REGISTRATION_ERROR');
        return new NextResponse('internal eroor',{status:500});
    }
};
