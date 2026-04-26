import re

file_path = "components/postit/postit-card.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Padding on Content Column
content = content.replace(
    '<div className="flex-none flex flex-col p-4 sm:p-10 md:p-12 gap-4 md:gap-6 relative z-0 min-h-min w-full">',
    '<div className="flex-none flex flex-col p-4 sm:p-6 md:p-8 gap-4 relative z-0 min-h-min w-full">'
)

# 2. Carousel item height + wrapper
from_carousel = """                        <div className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center rounded-lg overflow-hidden bg-black/5 p-2 md:p-4">
                          {imgUrl?.match(/\\.(mp4|webm|ogg)$/i) ? (
                            <div className="relative w-full h-full flex justify-center">
                              <video
                                src={`${imgUrl}#t=0.1`}
                                className="w-full h-full object-contain block drop-shadow-md rounded-md text-black"
                                preload="metadata"
                                controls
                                playsInline
                              />
                            </div>
                          ) : (
                            <div className="relative w-full h-full flex justify-center">
                              <img
                                src={imgUrl}
                                style={{ objectFit: 'contain' }}
                                alt={`Post-it medya ${index + 1}`}
                                className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity drop-shadow-md rounded-md"
"""
to_carousel = """                        <div className="relative w-full flex items-center justify-center rounded-xl overflow-hidden bg-transparent mb-1">
                          {imgUrl?.match(/\\.(mp4|webm|ogg)$/i) ? (
                              <video
                                src={`${imgUrl}#t=0.1`}
                                className="max-w-full max-h-[45vh] md:max-h-[50vh] w-auto h-auto object-contain block shadow-sm rounded-xl bg-black/5"
                                preload="metadata"
                                controls
                                playsInline
                              />
                          ) : (
                              <img
                                src={imgUrl}
                                alt={`Post-it medya ${index + 1}`}
                                className="max-w-full max-h-[45vh] md:max-h-[50vh] w-auto h-auto object-contain cursor-pointer hover:opacity-90 transition-opacity shadow-sm rounded-xl bg-black/5"
"""
content = content.replace(from_carousel, to_carousel)

# 3. Single image height + wrapper
from_single = """              mainImage && (
                  <div className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center rounded-lg overflow-hidden bg-black/5 p-2 md:p-4">
                    {mainImage?.match(/\\.(mp4|webm|ogg)$/i) ? (
                      <div className="relative w-full h-full flex justify-center">
                        <video
                          src={`${mainImage}#t=0.1`}
                          className="w-full h-full object-contain block drop-shadow-md rounded-md text-black"
                          preload="metadata"
                          controls
                          playsInline
                        />
                      </div>
                    ) : (
                      <div className="relative w-full h-full flex justify-center">
                        <img
                          src={mainImage}
                          style={{ objectFit: 'contain' }}
                          alt="Post-it Ana Medya"
                          className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity drop-shadow-md rounded-md"
"""
to_single = """              mainImage && (
                  <div className="relative w-full flex flex-col items-center justify-center rounded-xl overflow-hidden bg-transparent mb-1">
                    {mainImage?.match(/\\.(mp4|webm|ogg)$/i) ? (
                        <video
                          src={`${mainImage}#t=0.1`}
                          className="max-w-full max-h-[45vh] md:max-h-[50vh] w-auto h-auto object-contain block shadow-sm rounded-xl bg-black/5"
                          preload="metadata"
                          controls
                          playsInline
                        />
                    ) : (
                        <img
                          src={mainImage}
                          alt="Post-it Ana Medya"
                          className="max-w-full max-h-[45vh] md:max-h-[50vh] w-auto h-auto object-contain cursor-pointer hover:opacity-90 transition-opacity shadow-sm rounded-xl bg-black/5"
"""
content = content.replace(from_single, to_single)

# 4. Comments section padding
content = content.replace(
    "<div id=\"comments-section\" className={`w-full shrink-0 flex flex-col ${commentsList.length > 0 ? 'p-4 sm:p-10 md:p-12' : 'px-4 sm:px-10 md:px-12 py-4 sm:py-8'}",
    "<div id=\"comments-section\" className={`w-full shrink-0 flex flex-col ${commentsList.length > 0 ? 'p-4 sm:p-6 md:p-8' : 'px-4 sm:px-6 md:px-8 py-4 sm:py-6'}"
)

# 5. Move Sub-info to the top, before standard text content.
# We need to extract the Sub-info block and inject it after the Link Preview block.
sub_info_start = content.find('{/* Sub-info */}')
if sub_info_start != -1:
    sub_info_end_pattern = r'</div>\s*</div>\s*<div id="comments-section"'
    match = re.search(sub_info_end_pattern, content[sub_info_start:])
    if match:
        # Note: the match ends right where the comment section starts. But wait, `</div>\n            {/* End Content Column */}\n          </div>` is what closes the Content Column.
        # Let's be manual about parsing the sub info.
        pass

# Since regex extraction of HTML blocks can be brittle due to nested divs, let's just do a specific string replace.

src_sub_info = """            {/* Sub-info */}
            <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-6 border-t ${ottModalTextColor || postitAppearance?.textColor ? 'border-current opacity-90' : 'border-black/10 text-gray-700'} text-sm mt-4`}>
              <div className="flex flex-col gap-1">
                <div className="font-bold text-lg flex items-center gap-3">
                  {userImage ? (
                    <Image src={userImage} width={32} height={32} unoptimized={userImage.startsWith('data:')} alt={userName} className="w-8 h-8 rounded-full object-cover shrink-0 border border-black/10 shadow-sm" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center shrink-0 shadow-sm">
                      <span className="text-black/60 text-sm font-bold">{userName.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  {userName} 
                  {authorId && <UserFollowButton userId={authorId} variant="icon" />}
                </div>
                <div className={`${ottModalTextColor || postitAppearance?.textColor ? 'opacity-70' : 'opacity-80'}`}>{categoryName} • {createdAt.toLocaleDateString('tr-TR')}</div>
              </div>

              <div className="flex items-center gap-3">
                {link && (
                  <a
                    href={link}
                    target={(link.includes('panodasehir.com') || link.startsWith('/')) ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center justify-center text-blue-700 hover:text-blue-900 font-medium bg-white/50 w-9 h-9 rounded-full shadow hover:bg-white/80 transition-colors"
                    title="Bağlantıyı Ziyaret Et"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {canDelete && (
                  <Button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    variant="destructive"
                    size="icon"
                    className="flex shrink-0 items-center justify-center rounded-full shadow hover:bg-red-700 transition-colors w-9 h-9"
                    title="Notu Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                {!canDelete && currentUserId && (
                  <Button
                    onClick={handleReport}
                    disabled={isReporting}
                    variant="outline"
                    size="icon"
                    className="flex shrink-0 items-center justify-center rounded-full border-gray-300 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors w-9 h-9 bg-white/80 shadow"
                    title="Şikayet Et"
                  >
                    <Flag className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>"""

dest_sub_info = """            {/* Sub-info / Byline */}
            <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 mb-2 border-b ${ottModalTextColor || postitAppearance?.textColor ? 'border-current opacity-90' : 'border-black/5 text-gray-700'} text-sm`}>
              <div className="flex items-center gap-3">
                  {userImage ? (
                    <Image src={userImage} width={36} height={36} unoptimized={userImage.startsWith('data:')} alt={userName} className="w-9 h-9 rounded-full object-cover shrink-0 border border-black/10 shadow-sm" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center shrink-0 shadow-sm">
                      <span className="text-black/60 text-sm font-bold">{userName.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="flex flex-col">
                     <div className="font-bold flex items-center gap-2">
                        {userName} 
                        {authorId && <UserFollowButton userId={authorId} variant="icon" />}
                     </div>
                     <div className={`text-xs ${ottModalTextColor || postitAppearance?.textColor ? 'opacity-70' : 'text-gray-500'}`}>{categoryName} • {createdAt.toLocaleDateString('tr-TR')}</div>
                  </div>
              </div>

              <div className="flex items-center gap-2">
                {link && (
                  <a
                    href={link}
                    target={(link.includes('panodasehir.com') || link.startsWith('/')) ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center justify-center text-blue-600 hover:text-blue-800 font-medium bg-white/60 w-8 h-8 rounded-full shadow-sm hover:bg-white transition-colors"
                    title="Bağlantıyı Ziyaret Et"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {canDelete && (
                  <Button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    variant="destructive"
                    size="icon"
                    className="flex shrink-0 items-center justify-center rounded-full shadow-sm hover:bg-red-700 transition-colors w-8 h-8"
                    title="Notu Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                {!canDelete && currentUserId && (
                  <Button
                    onClick={handleReport}
                    disabled={isReporting}
                    variant="outline"
                    size="icon"
                    className="flex shrink-0 items-center justify-center rounded-full border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors w-8 h-8 bg-white/80 shadow-sm"
                    title="Şikayet Et"
                  >
                    <Flag className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>"""

if src_sub_info in content:
    # First, erase it from the bottom
    content = content.replace(src_sub_info, "")
    # Next, inject it right after Title area, wait no, BEFORE the text content
    
    inject_target = "{/* Content */}"
    if inject_target in content:
        content = content.replace(inject_target, inject_target + "\n" + dest_sub_info + "\n")

# Reduce magazine styling gaps
content = content.replace(
    'className={`whitespace-pre-wrap leading-relaxed font-medium mt-4',
    'className={`whitespace-pre-wrap leading-normal font-medium mt-2'
)

# Clean up bottom comments input gap
content = content.replace(
    '<div className={`w-full relative z-10 mb-2`}>',
    '<div className={`w-full relative z-10 mt-1`}>'
)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS")
