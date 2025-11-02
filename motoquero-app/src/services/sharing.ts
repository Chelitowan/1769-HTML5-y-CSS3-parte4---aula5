import { Share } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

export const SharingService = {
  generateShareToken(): string {
    return uuidv4();
  },

  generateTrackingUrl(token: string): string {
    // En producción, esto sería tu dominio real
    return `https://motoquero.app/track/${token}`;
  },

  async shareTrackingLink(token: string, totalPrice: number): Promise<boolean> {
    try {
      const url = this.generateTrackingUrl(token);
      const message = `🏍️ Tu viaje con Motoquero está en camino!\n\n💰 Precio acordado: $${totalPrice.toFixed(
        2
      )}\n\n📍 Rastrea tu viaje en tiempo real:\n${url}\n\n¡Gracias por usar Motoquero!`;

      const result = await Share.share({
        message,
        title: 'Rastrea tu viaje - Motoquero',
      });

      return result.action === Share.sharedAction;
    } catch (error) {
      console.error('Error sharing tracking link:', error);
      return false;
    }
  },

  async shareText(text: string): Promise<boolean> {
    try {
      const result = await Share.share({ message: text });
      return result.action === Share.sharedAction;
    } catch (error) {
      console.error('Error sharing text:', error);
      return false;
    }
  },
};
