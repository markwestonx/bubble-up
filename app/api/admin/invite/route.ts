import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const EMAIL_USER = process.env.BACKUP_EMAIL_USER || '';
const EMAIL_PASSWORD = process.env.BACKUP_EMAIL_PASSWORD || '';
const EMAIL_FROM = process.env.BACKUP_EMAIL_FROM || 'BubbleUp <noreply@bubbleup.app>';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role, project } = body;

    if (!email || !role || !project) {
      return NextResponse.json(
        { error: 'Missing required fields: email, role, project' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Create user in Supabase Auth
    const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });

    if (createError) {
      return NextResponse.json(
        { error: `Failed to create user: ${createError.message}` },
        { status: 500 }
      );
    }

    // Assign role
    const { error: roleError } = await supabaseAdmin
      .from('user_project_roles')
      .insert({
        user_id: newUser.user.id,
        project,
        role
      });

    if (roleError) {
      console.error('Failed to assign role:', roleError);
    }

    // Generate password reset link
    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
    });

    if (resetError) {
      return NextResponse.json(
        { error: 'User created but failed to generate invite link' },
        { status: 500 }
      );
    }

    // Send email invite
    if (EMAIL_USER && EMAIL_PASSWORD) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASSWORD
          }
        });

        const inviteLink = resetData.properties.action_link;

        await transporter.sendMail({
          from: EMAIL_FROM,
          to: email,
          subject: `You've been invited to BubbleUp - ${project}`,
          text: `
Welcome to BubbleUp!

You've been invited to join the "${project}" project with ${role} access.

Click the link below to set your password and get started:

${inviteLink}

This link will expire in 24 hours.

---
BubbleUp Team
          `.trim(),
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Welcome to BubbleUp!</h2>
              <p>You've been invited to join the <strong>"${project}"</strong> project with <strong>${role}</strong> access.</p>
              <p>Click the button below to set your password and get started:</p>
              <p style="margin: 30px 0;">
                <a href="${inviteLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Set Your Password
                </a>
              </p>
              <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #666; font-size: 12px;">BubbleUp Team</p>
            </div>
          `.trim()
        });

        return NextResponse.json({
          message: 'User invited successfully',
          userId: newUser.user.id,
          email,
          inviteLink
        });
      } catch (emailError) {
        console.error('Failed to send invite email:', emailError);
        return NextResponse.json({
          message: 'User created but email failed to send',
          userId: newUser.user.id,
          inviteLink: resetData.properties.action_link,
          warning: 'Please share the invite link manually'
        });
      }
    } else {
      return NextResponse.json({
        message: 'User created (email not configured)',
        userId: newUser.user.id,
        inviteLink: resetData.properties.action_link,
        warning: 'Email service not configured. Share this link manually.'
      });
    }
  } catch (err) {
    console.error('Error inviting user:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
