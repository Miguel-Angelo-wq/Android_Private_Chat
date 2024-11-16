import 'package:bonsoir/bonsoir.dart';
import 'package:chat/dialogs/broadcast_prompt.dart';
import 'package:chat/dialogs/discovery_prompt.dart';
import 'package:chat/models/broadcast.dart';
import 'package:chat/models/discovery.dart';
import 'package:chat/pages/pages.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Adds a broadcast or a discovery.
class AddIcon extends ConsumerWidget {
  /// Creates a new "Add" icon instance.
  const AddIcon({
    super.key,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    AppPage currentPage = ref.watch(appPageProvider);
    return IconButton(
      onPressed: () async {
        switch (currentPage) {
          case AppPage.discoveries:
            String? type = await DiscoveryPromptDialog.prompt(context);
            if (type != null) {
              ref.read(discoveryModelProvider).start(type);
            }
            break;
          case AppPage.broadcasts:
            BonsoirService? service =
                await BroadcastPromptDialog.prompt(context);
            if (service != null) {
              ref.read(broadcastModelProvider).start(service);
            }
            break;
        }
      },
      icon: const Icon(Icons.add),
      tooltip:
          'Add a ${currentPage == AppPage.discoveries ? 'discovery' : 'broadcast'}',
    );
  }
}
