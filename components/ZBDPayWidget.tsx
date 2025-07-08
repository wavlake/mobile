import React, { useState, useRef } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { WebView, WebViewErrorEvent } from "react-native-webview";
import { Text } from "./shared/Text";
import { Button } from "./shared/Button";
import { brandColors } from "@/constants";

interface ZBDPayWidgetProps {
  widgetUrl: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

interface ZBDPayMessage {
  type: string;
  payload?: any;
}

// Validate ZBD Pay widget URL
const isValidZBDPayUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.hostname === "ramp.zbdpay.com" ||
      parsedUrl.hostname === "zbdpay.com" ||
      parsedUrl.hostname.endsWith(".zbdpay.com")
    );
  } catch {
    return false;
  }
};

// Validate message structure
const isValidZBDPayMessage = (data: any): data is ZBDPayMessage => {
  return data && typeof data === "object" && typeof data.type === "string";
};

export const ZBDPayWidget: React.FC<ZBDPayWidgetProps> = ({
  widgetUrl,
  onSuccess,
  onError,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  // Validate widget URL
  if (!isValidZBDPayUrl(widgetUrl)) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            textAlign: "center",
            color: brandColors.pink.DEFAULT,
          }}
        >
          Invalid widget URL provided
        </Text>
        {onClose && (
          <Button
            onPress={onClose}
            color="gray"
            width={120}
            style={{ marginTop: 10 }}
          >
            Close
          </Button>
        )}
      </View>
    );
  }

  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleError = (syntheticEvent: WebViewErrorEvent) => {
    const { nativeEvent } = syntheticEvent;
    const errorMessage = `Failed to load widget: ${nativeEvent.description}`;
    setError(errorMessage);
    setIsLoading(false);
    onError?.(errorMessage);
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      // Validate message structure
      if (!isValidZBDPayMessage(data)) {
        console.warn("Invalid message structure from ZBD Pay widget:", data);
        return;
      }

      switch (data.type) {
        case "zbd_pay_success":
          onSuccess?.(data.payload);
          break;
        case "zbd_pay_error":
          onError?.(data.payload?.message || "Payment failed");
          break;
        case "zbd_pay_close":
          onClose?.();
          break;
        default:
          console.log("Unknown message from ZBD Pay widget:", data);
      }
    } catch (err) {
      console.error("Error parsing message from ZBD Pay widget:", err);
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            textAlign: "center",
            marginBottom: 20,
            color: brandColors.pink.DEFAULT,
          }}
        >
          {error}
        </Text>
        <Button onPress={handleRetry} color="orange" width={120}>
          Retry
        </Button>
        {onClose && (
          <Button
            onPress={onClose}
            color="gray"
            width={120}
            style={{ marginTop: 10 }}
          >
            Close
          </Button>
        )}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {isLoading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: brandColors.black.DEFAULT,
            zIndex: 1,
          }}
        >
          <ActivityIndicator size="large" color={brandColors.orange.DEFAULT} />
          <Text style={{ marginTop: 10, fontSize: 16 }}>
            Loading Bitcoin purchase...
          </Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: widgetUrl }}
        onLoad={handleLoad}
        onError={handleError}
        onMessage={handleMessage}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        // Security settings for iframe sandbox equivalent
        allowsBackForwardNavigationGestures={false}
        allowsLinkPreview={false}
        allowsFullscreenVideo={false}
        // Inject JavaScript to handle ZBD Pay events
        injectedJavaScript={`
          // Listen for ZBD Pay events and forward to React Native
          window.addEventListener('message', function(event) {
            if (event.origin === 'https://ramp.zbdpay.com') {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: event.data.type,
                payload: event.data.payload
              }));
            }
          });
          
          // ZBD Pay widget integration complete
          
          true; // Required for injected JavaScript
        `}
      />
    </View>
  );
};
