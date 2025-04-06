"use client"

import { Button } from "@/components/ui/button"

export default function GeneralSettingsPage() {
    return (
        <div>
            <h1>General Settings</h1>
            <Button onClick={() => {
                fetch("http://localhost:8000/api/v1/script/generate", {
                    method: "POST",
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        // const script = document.createElement('script');
                        // script.src = data.script;
                        // document.head.appendChild(script);
                        // Avoid using eval() as it can execute arbitrary code and is a security risk
                        // Instead, create a script element and append it to the document
                        // const script = document.createElement('script');
                        // script.type = 'text/javascript';
                        // script.text = data.script;
                        // document.head.appendChild(script);
                        eval(data.script);
                    });
            }}>Trigger Chatbot Script</Button>
        </div>
    )
}