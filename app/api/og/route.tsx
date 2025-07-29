import { ImageResponse } from 'next/og';
 
export const runtime = 'edge';
 
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
 
    // Get dynamic values
    const title = searchParams.get('title')?.slice(0, 100) || 'SpreadAPI';
    const description = searchParams.get('description')?.slice(0, 200) || 'Transform your Excel spreadsheets into powerful APIs';
    const category = searchParams.get('category') || 'Blog';
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            backgroundImage: 'linear-gradient(135deg, #9333EA 0%, #6366F1 100%)',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          {/* Content Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 80,
              maxWidth: 1000,
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 40,
              }}
            >
              <svg
                width="60"
                height="60"
                viewBox="0 0 60 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="60" height="60" rx="12" fill="white" fillOpacity="0.9"/>
                <path
                  d="M20 20H40V40H20V20Z"
                  stroke="#9333EA"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 28H40M28 20V40"
                  stroke="#9333EA"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                style={{
                  marginLeft: 20,
                  fontSize: 36,
                  fontWeight: 700,
                  color: 'white',
                }}
              >
                SpreadAPI
              </span>
            </div>
            
            {/* Category Badge */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '8px 24px',
                borderRadius: 40,
                fontSize: 18,
                fontWeight: 600,
                color: 'white',
                marginBottom: 24,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {category}
            </div>
            
            {/* Title */}
            <h1
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: 'white',
                margin: '0 0 24px 0',
                lineHeight: 1.2,
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              {title}
            </h1>
            
            {/* Description */}
            {description && (
              <p
                style={{
                  fontSize: 24,
                  color: 'rgba(255, 255, 255, 0.9)',
                  margin: 0,
                  lineHeight: 1.5,
                  maxWidth: 800,
                }}
              >
                {description}
              </p>
            )}
            
            {/* Bottom decoration */}
            <div
              style={{
                position: 'absolute',
                bottom: 40,
                left: 80,
                right: 80,
                height: 4,
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 2,
              }}
            />
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}