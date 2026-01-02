// export interface DeviceInfo {
//   timezone: string | null;
//   timezoneOffsetMinutes: number;
//   platform: string | null;
//   userAgent: string;
//   browser: string | null;
//   deviceType: 'mobile' | 'tablet' | 'desktop';
//   screen: { width: number; height: number; pixelRatio: number };
//   language: string | null;
//   clientType?: string | null;
//   deviceName?: string | null;
// }

// function detectBrowser(ua: string): string | null {
//   if (/edg/i.test(ua)) return 'Edge';
//   if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) return 'Chrome';
//   if (/firefox|fxios/i.test(ua)) return 'Firefox';
//   if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) return 'Safari';
//   if (/opr\//i.test(ua) || /opera/i.test(ua)) return 'Opera';
//   return null;
// }

// function detectDeviceType(ua: string): 'mobile' | 'tablet' | 'desktop' {
//   const isTablet = /ipad|tablet|playbook|silk/i.test(ua);
//   const isMobile = /iphone|android.+mobile|windows phone|blackberry|bb10|mobile/i.test(ua);
//   if (isTablet) return 'tablet';
//   if (isMobile) return 'mobile';
//   return 'desktop';
// }

// export function getDeviceInfo(extra?: { clientType?: string; deviceName?: string }): DeviceInfo {
//   const ua = navigator.userAgent || '';
//   const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || null;
//   return {
//     timezone: tz,
//     timezoneOffsetMinutes: new Date().getTimezoneOffset(),
//     platform: navigator.platform || null,
//     userAgent: ua,
//     browser: detectBrowser(ua),
//     deviceType: detectDeviceType(ua),
//     screen: { width: window.screen.width, height: window.screen.height, pixelRatio: window.devicePixelRatio || 1 },
//     language: navigator.language || null,
//     clientType: extra?.clientType ?? null,
//     deviceName: extra?.deviceName ?? null
//   };
// }

// export async function sha256Hex(input: unknown): Promise<string> {
//   const str = typeof input === 'string' ? input : JSON.stringify(input || {});
//   const enc = new TextEncoder().encode(str);
//   const buf = await crypto.subtle.digest('SHA-256', enc);
//   return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
// }
