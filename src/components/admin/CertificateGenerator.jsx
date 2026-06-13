import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Award, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CertificateGenerator({ registration, eventTitle }) {
  const [generating, setGenerating] = useState(false);
  const qc = useQueryClient();

  const saveCert = useMutation({
    mutationFn: ({ id, url }) => supabase.from('Registration').update({ certificate_url: url }).eq('id', id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-registrations'] });
      toast.success('Certificate generated & saved!');
    },
  });

  const generate = async () => {
    setGenerating(true);
    try {
      // Generate certificate as an image using AI
      const prompt = `Create a formal, elegant participation certificate for a college event. 
      Design a beautiful certificate with:
      - "Certificate of Participation" as the main heading in elegant serif font
      - "This is to certify that" in smaller text
      - "${registration.full_name}" as the recipient name in large, prominent script/cursive style
      - "${registration.roll_number} | ${registration.branch} | ${registration.year}" as student details below the name
      - "has successfully participated in" 
      - "${eventTitle}" as the event name in bold, highlighted text
      - "Spoorthi Cultural & Technical Festival" as the organizing body
      - Decorative border with gold/orange gradient theme, festive college fest feel
      - Professional layout on landscape orientation (16:9 ratio)
      - Warm color palette: deep navy/maroon background with gold accents and orange highlights
      - Space for signatures at the bottom with "Organized by Spoorthi Committee"
      - Star/sparkle decorative elements in corners
      Make it look premium and professional, worthy of being framed.`;

      // TODO: Replace with Supabase storage or appropriate image generation service
      // const result = await generateImage({ prompt });
      // await saveCert.mutateAsync({ id: registration.id, url: result.url });
    } catch (e) {
      toast.error('Generation failed: ' + (e.message || 'Try again'));
    }
    setGenerating(false);
  };

  const isLoading = generating || saveCert.isPending;

  return (
    <Button
      size="sm"
      onClick={generate}
      disabled={isLoading}
      className="rounded-xl gap-1.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
    >
      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
      {isLoading ? 'Generating...' : 'Auto-Generate'}
    </Button>
  );
}
