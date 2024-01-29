import wretch from "wretch";

import redis from "@/server/db/redis";

import type { IEmail } from "@/types/email";

export const sendMail = async (body: IEmail) => {
  try {
    const data = await wretch("https://mail.nisarg.workers.dev/send")
      .json(body)
      .auth(`Bearer rocetta_t0ilFP`)
      .post()
      .text();
    return data;
  } catch (e) {
    return "NOT OK";
  }
};

export const sendCode = async (email: string, userIdOrName: string) => {
  // TODO: Add location data to the email for security
  const code = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  await redis.set(`code:${email}:${code}`, userIdOrName, {
    ex: 60 * 5,
  });

  const body: IEmail = {
    to: email,
    from: {
      name: "Rocetta",
      email: "noreply@rocetta.com",
    },
    subject: `Rocetta Verification Code ${code}`,
    text: `LET'S GET YOU SIGNED IN

    Copy and paste this temporary login code:
    
    ${code}
    
    If you didn't try to login, you can safely ignore this email.
    
    Rocetta [https://rocetta.com]- a platform that helps you to pick, deploy, and manage multi-cloud infrastructure with providers like Amazon Web Services and Google Cloud.`,
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <html lang="en">
      <head data-id="__react-email-head"></head>
      <div id="__react-email-preview" style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">Let's get you signed in
      </div>
      <body data-id="__react-email-body" style="background-color:#ffffff">
        <table align="center" width="100%" data-id="__react-email-container" role="presentation" cellSpacing="0" cellPadding="0" border="0" style="max-width:37.5em;padding-left:12px;padding-right:12px;margin:0 auto">
          <tbody>
            <tr style="width:100%">
              <td>
                <h1 data-id="react-email-heading" style="color:#333;font-family:Inter, -apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;font-size:24px;font-weight:bold;margin-top:40px;padding:0">Let&#x27;s get you signed in</h1>
                <p data-id="react-email-text" style="font-size:14px;line-height:24px;margin:12px 0;color:#333;font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif">Copy and paste this temporary login code:</p><code style="display:inline-block;text-align:center;font-size:35px;padding:16px 4.5%;width:90.5%;background-color:#f4f4f4;border-radius:5px;border:1px solid #eee;color:#333">${code}</code>
                <p data-id="react-email-text" style="font-size:14px;line-height:24px;margin:12px 0;color:#ababab;font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;margin-top:14px;margin-bottom:16px">If you didn&#x27;t try to login, you can safely ignore this email.</p><img data-id="react-email-img" alt="Rocetta" src="https://splash-git-nisarg-dev-rocetta.vercel.app/rocetta.png" style="display:block;outline:none;border:none;text-decoration:none" />
                <p data-id="react-email-text" style="font-size:12px;line-height:22px;margin:16px 0;color:#898989;font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;margin-top:12px;margin-bottom:24px"><a href="https://rocetta.com" data-id="react-email-link" target="_blank" style="color:#898989;text-decoration:underline;font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;font-size:14px">Rocetta</a>- a platform that allows you to build, deploy, and manage your cloud across providers like Amazon Web Services and Google Cloud.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    
    </html>`,
    dkim: {
      domainName: "rocetta.com",
      privateKeyEnv: "ROCETTA_DKIM",
      keySelector: "mailchannels",
    },
  };

  const send = await sendMail(body);
  return send;
};
