import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { redirect } from 'next/navigation';
import React from 'react'

type Params = Promise<{ id: string }>;

const page = async ({params}: {params: Params}) => {
    const { id } = await params
    const qrCodeId = id[0];
    console.log(qrCodeId)
    const qrCodeRef = doc(db, "qrcodes", qrCodeId);
    const qrCodeSnap = await getDoc(qrCodeRef);
    
    let hotelId = null;
    if (qrCodeSnap.exists()) {
        hotelId = qrCodeSnap.data().hotelId;
        const numberOfQrScans = qrCodeSnap.data().numberOfQrScans || 0;
        await updateDoc(qrCodeRef, {
          numberOfQrScans: numberOfQrScans + .5
        });
        redirect(`/hotels/${hotelId}?qrScan=true&qid=${qrCodeId}${!hotelId ? '&error=hotel_not_assigned' : ''}`);

    }
    
  return (
    <div></div>
  )
}

export default page