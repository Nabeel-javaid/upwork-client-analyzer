from mcp.server.fastmcp import FastMCP
import os
import sys
import time
import signal
import smtplib
import imaplib
import email
import requests  # For downloading attachments via URL
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import email.utils
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Gmail Configuration
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
IMAP_HOST = "imap.gmail.com"
IMAP_PORT = 993
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

def signal_handler(sig, frame):
    print("Thanks for using Maitreya's server...")
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

# Create an MCP server with increased timeout (30 seconds)
mcp = FastMCP(
    name="gmail-mcp",
    host="127.0.0.1",
    port=5000,
    timeout=30
)

def send_email(recipient: str, subject: str, body: str, attachment_path: str = None) -> str:
    try:
        msg = MIMEMultipart()
        msg["From"] = SMTP_USERNAME
        msg["To"] = recipient
        msg["Subject"] = subject

        # Attach the email body
        msg.attach(MIMEText(body, "plain"))

        # Optionally attach a file if a valid path is provided
        if attachment_path:
            with open(attachment_path, "rb") as attachment:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(attachment.read())
            encoders.encode_base64(part)
            part.add_header("Content-Disposition", f"attachment; filename={os.path.basename(attachment_path)}")
            msg.attach(part)

        # Connect to Gmail SMTP and send the email
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.sendmail(SMTP_USERNAME, recipient, msg.as_string())
        server.quit()
        return "Email sent successfully."
    except Exception as e:
        return f"Failed to send email: {e}"

def download_attachment_from_url(attachment_url: str, attachment_filename: str) -> str:
    temp_dir = "temp_attachments"
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, attachment_filename)
    response = requests.get(attachment_url)
    with open(file_path, "wb") as f:
        f.write(response.content)
    return file_path

def get_pre_staged_attachment(attachment_name: str) -> str:
    attachment_dir = "available_attachments"
    file_path = os.path.join(attachment_dir, attachment_name)
    if os.path.exists(file_path):
        return file_path
    else:
        return None

def fetch_recent_emails(num_emails: int = 3) -> list:
    """
    Fetch the most recent emails from Gmail inbox
    
    Parameters:
    - num_emails: Number of recent emails to fetch (default: 3)
    
    Returns:
    - List of dictionaries containing email details
    """
    try:
        # Connect to Gmail's IMAP server
        mail = imaplib.IMAP4_SSL(IMAP_HOST, IMAP_PORT)
        mail.login(SMTP_USERNAME, SMTP_PASSWORD)
        mail.select("inbox")
        
        # Search for all emails and get the latest ones
        status, data = mail.search(None, "ALL")
        mail_ids = data[0].split()
        
        # Get the most recent emails
        start_idx = max(0, len(mail_ids) - num_emails)
        recent_ids = mail_ids[start_idx:]
        
        # Reverse to get newest first
        recent_ids.reverse()
        
        emails = []
        for mail_id in recent_ids:
            status, data = mail.fetch(mail_id, "(RFC822)")
            raw_email = data[0][1]
            msg = email.message_from_bytes(raw_email)
            
            # Get basic email details
            subject = msg.get("Subject", "")
            from_address = msg.get("From", "")
            date_str = msg.get("Date", "")
            
            # Parse date
            date_tuple = email.utils.parsedate_tz(date_str)
            if date_tuple:
                local_date = datetime.fromtimestamp(email.utils.mktime_tz(date_tuple))
                date_formatted = local_date.strftime("%Y-%m-%d %H:%M:%S")
            else:
                date_formatted = date_str
            
            # Extract plain text body
            body = ""
            if msg.is_multipart():
                for part in msg.walk():
                    content_type = part.get_content_type()
                    content_disposition = str(part.get("Content-Disposition"))
                    
                    # Skip attachments
                    if "attachment" in content_disposition:
                        continue
                    
                    # Get text content
                    if content_type == "text/plain":
                        body = part.get_payload(decode=True).decode()
                        break
            else:
                body = msg.get_payload(decode=True).decode()
            
            # Add to email list
            emails.append({
                "id": mail_id.decode(),
                "subject": subject,
                "from": from_address,
                "date": date_formatted,
                "body": body[:300] + "..." if len(body) > 300 else body  # Truncate long bodies
            })
        
        mail.close()
        mail.logout()
        return emails
        
    except Exception as e:
        return [{"error": f"Failed to fetch emails: {e}"}]

@mcp.tool()
def send_email_tool(recipient: str, subject: str, body: str, 
                    attachment_path: str = None, 
                    attachment_url: str = None, 
                    attachment_name: str = None) -> str:
    """
    Send an email via Gmail SMTP.
    
    Parameters:
    - recipient: The email address to send the email to.
    - subject: The email subject.
    - body: The email body text.
    - attachment_path: Optional direct file path for an attachment.
    - attachment_url: Optional URL from which to download an attachment.
    - attachment_name: Optional filename for the attachment.
    
    Priority:
      1. If attachment_url is provided (and attachment_name for filename), download the file.
      2. Else if attachment_name is provided, try to load it from the 'available_attachments' directory.
      3. Otherwise, use attachment_path if provided.
    """
    final_attachment_path = attachment_path
    # Use URL-based attachment if provided
    if attachment_url and attachment_name:
        try:
            final_attachment_path = download_attachment_from_url(attachment_url, attachment_name)
        except Exception as e:
            return f"Failed to download attachment from URL: {e}"
    # Otherwise, use pre-staged attachment if specified
    elif attachment_name:
        final_attachment_path = get_pre_staged_attachment(attachment_name)
        if not final_attachment_path:
            return f"Error: Attachment '{attachment_name}' not found in pre-staged directory."
    
    return send_email(recipient, subject, body, final_attachment_path)

@mcp.tool()
def fetch_emails_tool(num_emails: int = 3) -> list:
    """
    Fetch recent emails from your Gmail inbox.
    
    Parameters:
    - num_emails: Number of recent emails to fetch (default: 3)
    
    Returns:
    - List of recent emails with their details
    """
    return fetch_recent_emails(num_emails)

if __name__ == "__main__":
    try:
        print("Starting MCP server 'gmail-mcp' on 127.0.0.1:5000")
        mcp.run()
    except Exception as e:
        print(f"Error: {e}")
        time.sleep(5)