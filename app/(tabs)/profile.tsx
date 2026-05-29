import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { ProfileRow, getProfile, upsertProfile } from '@/db/queries';

type Draft = { name: string; bio: string; photoUri: string | null };

async function persistPhoto(uri: string): Promise<string> {
  const filename = uri.split('/').pop() ?? `photo_${Date.now()}.jpg`;
  const dest = `${FileSystem.documentDirectory}profile_${filename}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>({ name: '', bio: '', photoUri: null });
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<TextInput>(null);

  useEffect(() => {
    getProfile().then(setProfile);
  }, []);

  function startEdit() {
    setDraft({
      name: profile?.name ?? '',
      bio: profile?.bio ?? '',
      photoUri: profile?.photo_uri ?? null,
    });
    setEditing(true);
    setTimeout(() => nameRef.current?.focus(), 100);
  }

  function cancelEdit() {
    setEditing(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await upsertProfile(draft.name.trim(), draft.bio.trim(), draft.photoUri);
      setProfile((prev) => ({
        id: prev?.id ?? 1,
        name: draft.name.trim(),
        bio: draft.bio.trim(),
        photo_uri: draft.photoUri,
      }));
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library in Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      const persisted = await persistPhoto(result.assets[0].uri);
      setDraft((d) => ({ ...d, photoUri: persisted }));
    }
  }

  const displayName = profile?.name?.trim() || '';
  const displayBio = profile?.bio?.trim() || '';
  const photoUri = editing ? draft.photoUri : profile?.photo_uri ?? null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header row */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>Profile</Text>
            {!editing ? (
              <TouchableOpacity onPress={startEdit} hitSlop={12}>
                <Text style={styles.editBtn}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={cancelEdit} hitSlop={12}>
                <Text style={styles.cancelBtn}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={styles.avatarWrap}
              onPress={editing ? pickPhoto : undefined}
              activeOpacity={editing ? 0.75 : 1}
            >
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatar} contentFit="cover" />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>
                    {displayName ? displayName[0].toUpperCase() : '?'}
                  </Text>
                </View>
              )}

              {/* Camera overlay in edit mode */}
              {editing && (
                <View style={styles.avatarOverlay}>
                  <Text style={styles.cameraIcon}>📷</Text>
                </View>
              )}
            </TouchableOpacity>

            {editing && (
              <TouchableOpacity onPress={pickPhoto} style={styles.changePhotoBtn}>
                <Text style={styles.changePhotoText}>
                  {photoUri ? 'Change photo' : 'Add photo'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Name */}
          <View style={styles.field}>
            {editing ? (
              <TextInput
                ref={nameRef}
                style={styles.nameInput}
                value={draft.name}
                onChangeText={(t) => setDraft((d) => ({ ...d, name: t }))}
                placeholder="Your name"
                placeholderTextColor="#CCCCCC"
                maxLength={60}
                returnKeyType="next"
                textAlign="center"
              />
            ) : (
              <Text style={[styles.name, !displayName && styles.namePlaceholder]}>
                {displayName || 'Add your name'}
              </Text>
            )}
          </View>

          {/* Bio */}
          <View style={styles.field}>
            {editing ? (
              <View>
                <TextInput
                  style={styles.bioInput}
                  value={draft.bio}
                  onChangeText={(t) => setDraft((d) => ({ ...d, bio: t }))}
                  placeholder="Tell us a little about yourself…"
                  placeholderTextColor="#CCCCCC"
                  multiline
                  maxLength={500}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{draft.bio.length}/500</Text>
              </View>
            ) : (
              <Text style={[styles.bio, !displayBio && styles.bioPlaceholder]}>
                {displayBio || 'No bio yet.'}
              </Text>
            )}
          </View>

          {/* Save button */}
          {editing && (
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Profile'}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const AVATAR_SIZE = 110;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  scroll: {
    padding: 20,
    paddingBottom: 48,
    alignItems: 'center',
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  editBtn: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  cancelBtn: {
    fontSize: 16,
    fontWeight: '500',
    color: '#888888',
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#AAAAAA',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    fontSize: 28,
  },
  changePhotoBtn: {
    marginTop: 10,
  },
  changePhotoText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },

  // Fields
  field: {
    width: '100%',
    marginBottom: 28,
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#AAAAAA',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },

  // Name
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  namePlaceholder: {
    color: '#CCCCCC',
    fontWeight: '400',
  },
  nameInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
    paddingVertical: 6,
    width: '100%',
    letterSpacing: -0.3,
  },

  // Bio
  bio: {
    fontSize: 15,
    color: '#444444',
    textAlign: 'center',
    lineHeight: 22,
  },
  bioPlaceholder: {
    color: '#CCCCCC',
  },
  bioInput: {
    fontSize: 15,
    color: '#000000',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 14,
    minHeight: 120,
    lineHeight: 22,
    width: '100%',
  },
  charCount: {
    fontSize: 11,
    color: '#AAAAAA',
    textAlign: 'right',
    marginTop: 6,
  },

  // Save
  saveBtn: {
    backgroundColor: '#000000',
    borderRadius: 14,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: {
    backgroundColor: '#CCCCCC',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
