// src/app/api/admin/create-first-admin/route.js

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request) {
  try {
    const { phone, secretKey } = await request.json();

    // Verify the secret key to prevent unauthorized access
    // Use a strong, unique value in your .env file
    const expectedSecretKey =
      process.env.ADMIN_SECRET_KEY || "your-default-secret-key-change-this";

    if (secretKey !== expectedSecretKey) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Check if the phone number exists
    const user = await db.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user role to admin
    await db.user.update({
      where: { id: user.id },
      data: {
        role: "admin",
        verified: true, // Also mark as verified if not already
      },
    });

    return NextResponse.json({
      message: `User ${phone} has been made an admin successfully`,
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: "Error creating admin" },
      { status: 500 }
    );
  }
}

// Also add a GET method to provide a simple form for making the first admin
export async function GET() {
  // Count admins to check if we already have one
  const adminCount = await db.user.count({
    where: {
      role: "admin",
    },
  });

  // If we already have admins, don't show the form
  if (adminCount > 0) {
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Admin Already Exists</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 2rem; max-width: 500px; margin: 0 auto; }
            .card { background: #f8f9fa; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { margin-bottom: 1.5rem; }
            h1 { margin: 0; font-size: 1.5rem; color: #343a40; }
            p { color: #495057; line-height: 1.5; }
            .link { display: inline-block; margin-top: 1rem; color: #007bff; text-decoration: none; }
            .link:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>Admin User Already Exists</h1>
            </div>
            <p>An admin user has already been created in the system. This page is only for initial setup.</p>
            <a href="/login" class="link">Go to Login</a>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  }

  // Get all users for the dropdown
  const users = await db.user.findMany({
    select: {
      id: true,
      phone: true,
      name: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Return an HTML form
  return new Response(
    `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Create First Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 2rem; max-width: 500px; margin: 0 auto; }
          .card { background: #f8f9fa; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { margin-bottom: 1.5rem; }
          h1 { margin: 0; font-size: 1.5rem; color: #343a40; }
          p { color: #495057; line-height: 1.5; margin-bottom: 1.5rem; }
          .form-group { margin-bottom: 1rem; }
          label { display: block; margin-bottom: 0.5rem; color: #495057; font-weight: 500; }
          select, input { width: 100%; padding: 0.5rem; border: 1px solid #ced4da; border-radius: 4px; }
          .message { padding: 1rem; margin: 1rem 0; border-radius: 4px; display: none; }
          .error { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
          .success { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
          button { background: #007bff; color: white; border: none; padding: 0.75rem 1rem; border-radius: 4px; cursor: pointer; font-weight: 500; }
          button:hover { background: #0069d9; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>Create First Admin</h1>
          </div>
          <p>This page allows you to designate a user as an admin. This should only be used during initial setup.</p>
          
          <div id="message" class="message"></div>
          
          <form id="adminForm">
            ${
              users.length > 0
                ? `
              <div class="form-group">
                <label for="phone">Select User:</label>
                <select id="phone" name="phone" required>
                  ${users
                    .map(
                      (user) => `
                    <option value="${user.phone}">${user.name || "Unnamed"} (${
                        user.phone
                      })</option>
                  `
                    )
                    .join("")}
                </select>
              </div>
            `
                : `
              <p>No users found in the system. Please register at least one user first.</p>
            `
            }
            
            <div class="form-group">
              <label for="secretKey">Secret Key:</label>
              <input type="password" id="secretKey" name="secretKey" placeholder="Enter the secret key" required>
            </div>
            
            ${
              users.length > 0
                ? `
              <button type="submit">Make Admin</button>
            `
                : `
              <a href="/register" style="text-decoration: none;"><button type="button">Register First</button></a>
            `
            }
          </form>
        </div>
        
        <script>
          const form = document.getElementById('adminForm');
          const messageDiv = document.getElementById('message');
          
          if (form) {
            form.addEventListener('submit', async (e) => {
              e.preventDefault();
              
              const phone = document.getElementById('phone').value;
              const secretKey = document.getElementById('secretKey').value;
              
              try {
                const response = await fetch('/api/admin/create-first-admin', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ phone, secretKey }),
                });
                
                const result = await response.json();
                
                if (response.ok) {
                  messageDiv.textContent = result.message;
                  messageDiv.className = 'message success';
                  messageDiv.style.display = 'block';
                  
                  // Redirect to login after 2 seconds
                  setTimeout(() => {
                    window.location.href = '/login';
                  }, 2000);
                } else {
                  messageDiv.textContent = result.error;
                  messageDiv.className = 'message error';
                  messageDiv.style.display = 'block';
                }
              } catch (error) {
                messageDiv.textContent = 'An error occurred. Please try again.';
                messageDiv.className = 'message error';
                messageDiv.style.display = 'block';
              }
            });
          }
        </script>
      </body>
    </html>
    `,
    {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    }
  );
}
