import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { urlState } from '@/context';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as yup from "yup";
import Error from './Error';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { QRCode } from "react-qrcode-logo";
import { useFetch } from "@/hooks/useFetch";
import { createUrl } from "@/db/apiUrls";
import { BeatLoader } from "react-spinners";

const CreateLink = () => {
    const {user} = urlState()
    const navigate = useNavigate();

    let [searchParams, setSearchParams] = useSearchParams();
    const longLink = searchParams.get("createNew");

    const ref = useRef();

    const [errors, setErrors] = useState({});
    const [formValues, setFormValues] = useState({
        title: "",
        longUrl: longLink ? longLink : "",
        customUrl: "",
    });

    const schema = yup.object().shape({
        title: yup.string().required("Title is required"),
        longUrl: yup
          .string()
          .url("Must be a valid URL")
          .required("Long URL is required"),
        customUrl: yup.string(),
      });

    const handleChange = (e) => {
    setFormValues({
        ...formValues,
        [e.target.id]: e.target.value,
    });
    };

    const {loading, error, data, fn: fnCreateUrl}=useFetch(createUrl, {...formValues, user_id: user.id});

    useEffect(() => {
        if (error === null && data) {
          navigate(`/link/${data[0].id}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [error, data]);

    const createNewUrl = async()=>{
        setErrors([]);
        try {
            await schema.validate(formValues, {abortEarly:false})
            const canvas = ref.current.canvasRef.current;

            const blob =await new Promise((resolve) => canvas.toBlob(resolve));

            await fnCreateUrl(blob)

        } catch (e) {
            const newErrors = {};

            e?.inner?.forEach((err) => {
                newErrors[err.path] = err.message;
            });

            setErrors(newErrors);
        }
    }

  return (
    <div>
        <Dialog
        defaultOpen={longLink}
        onOpenChange={(res) => {
          if (!res) setSearchParams({});
        }}
        >
            <DialogTrigger>
                <Button variant="destructive">Create New Link</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-bold text-2xl">Create New</DialogTitle>
                </DialogHeader>
                {formValues?.longUrl && (
                <QRCode ref={ref} size={250} value={formValues?.longUrl} />
                )}
                <Input 
                id="title" 
                placeholder="Short Link's Title" 
                value={formValues.title} 
                onChange={handleChange}/>
                 {errors.title && <Error message={errors.title} />}

                <Input 
                id="longUrl" 
                placeholder="Enter your Looong URL" 
                value={formValues.longUrl}
                onChange={handleChange}/>
                {errors.longUrl && <Error message={errors.longUrl} />}
                <div className="flex items-center gap-2">
                    <Card className="p-2">shortscan.site</Card> /
                    <Input 
                    id="customUrl" 
                    placeholder="Custom Link(optional)"
                    value={formValues.customUrl}
                    onChange={handleChange}/>
                </div>
                {error && <Error message={errors.message} />}

                <DialogFooter className="sm:justify-start">
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={createNewUrl}
                        disabled={loading}
                    >
                        {loading ? <BeatLoader size={10} color="white" /> : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  )
}

export default CreateLink