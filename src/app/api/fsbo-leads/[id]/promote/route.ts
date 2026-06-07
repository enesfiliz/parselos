import { NextResponse } from "next/server";

import { revalidatePath } from "next/cache";



import { promoteFsboLeadToClient } from "@/lib/fsbo/promote-fsbo-lead";



export async function POST(

  request: Request,

  context: { params: Promise<{ id: string }> },

) {

  try {

    const { id } = await context.params;

    const body = (await request.json().catch(() => ({}))) as {

      clientId?: string;

    };



    if (!body.clientId?.trim()) {

      return NextResponse.json(

        {

          error:

            "clientId zorunludur. FSBO ilanı yalnızca mevcut bir müşteriye bağlanabilir.",

        },

        { status: 400 },

      );

    }



    const result = await promoteFsboLeadToClient(id, body.clientId.trim());



    revalidatePath("/deals");

    revalidatePath("/fsbo-radar");

    revalidatePath("/customers");



    return NextResponse.json({ success: true, data: result });

  } catch (error) {

    console.error("[POST /api/fsbo-leads/promote]", error);

    const message =

      error instanceof Error ? error.message : "Pipeline'a eklenemedi.";

    return NextResponse.json({ error: message }, { status: 500 });

  }

}

